const jwt = require('jsonwebtoken');
const { User, Role, Department } = require('../models');
const { logAuth } = require('../middleware/audit');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({
            where: { email },
            include: [
                { model: Role, as: 'role' },
                { model: Department, as: 'department' }
            ]
        });

        if (!user) {
            await logAuth(null, 'LOGIN', false, req);
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Check if user is active
        if (!user.is_active) {
            await logAuth(user.id, 'LOGIN', false, req);
            return res.status(403).json({
                error: 'Usuario inactivo'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            await logAuth(user.id, 'LOGIN', false, req);
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Update last login
        await user.update({ last_login: new Date() });

        // Generate tokens
        const accessToken = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Log successful login
        await logAuth(user.id, 'LOGIN', true, req);

        // Return tokens and user data
        res.json({
            accessToken,
            refreshToken,
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        // Log logout
        await logAuth(req.user.id, 'LOGOUT', true, req);

        res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Get current user
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [
                { model: Role, as: 'role' },
                { model: Department, as: 'department' }
            ],
            attributes: { exclude: ['password_hash'] }
        });

        res.json({ user });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: 'Refresh token requerido'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        if (decoded.type !== 'refresh') {
            return res.status(403).json({
                error: 'Token inválido'
            });
        }

        // Check if user exists and is active
        const user = await User.findByPk(decoded.userId);

        if (!user || !user.is_active) {
            return res.status(403).json({
                error: 'Usuario no encontrado o inactivo'
            });
        }

        // Generate new access token
        const newAccessToken = generateToken(user.id);

        res.json({ accessToken: newAccessToken });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(403).json({
                error: 'Refresh token inválido o expirado'
            });
        }

        console.error('Error refrescando token:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    login,
    logout,
    getCurrentUser,
    refreshToken
};
