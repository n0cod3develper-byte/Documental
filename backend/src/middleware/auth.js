const jwt = require('jsonwebtoken');
const { User, Role, Department } = require('../models');

/**
 * Middleware to authenticate JWT token
 * Extracts token from Authorization header and verifies it
 * Attaches user object to req.user
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from header or query param (for preview/streaming)
        const authHeader = req.headers['authorization'];
        let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        // If no header token, check query param 'token'
        if (!token && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({
                error: 'Token de autenticación no proporcionado'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findByPk(decoded.userId, {
            include: [
                { model: Role, as: 'role' },
                { model: Department, as: 'department' }
            ],
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            return res.status(403).json({
                error: 'Usuario no encontrado'
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                error: 'Usuario inactivo'
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                error: 'Token inválido'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({
                error: 'Token expirado'
            });
        }

        console.error('Error en autenticación:', error);
        return res.status(500).json({
            error: 'Error en autenticación'
        });
    }
};

/**
 * Middleware to check if user has specific role
 * @param {...string} allowedRoles - Roles allowed to access the route
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'No autenticado'
            });
        }

        const userRole = req.user.role.name;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Permisos insuficientes',
                required: allowedRoles,
                current: userRole
            });
        }

        next();
    };
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for public endpoints that behave differently for authenticated users
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId, {
            include: [
                { model: Role, as: 'role' },
                { model: Department, as: 'department' }
            ],
            attributes: { exclude: ['password_hash'] }
        });

        req.user = user && user.is_active ? user : null;
        next();

    } catch (error) {
        req.user = null;
        next();
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    optionalAuth
};
