const { User, Role, Department } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all users
 * GET /api/users
 */
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, role_id, department_id, is_active } = req.query;

        // Build where clause
        const where = {};

        if (search) {
            where[Op.or] = [
                { first_name: { [Op.iLike]: `%${search}%` } },
                { last_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (role_id) where.role_id = role_id;
        if (department_id) where.department_id = department_id;
        if (is_active !== undefined) where.is_active = is_active === 'true';

        // Calculate pagination
        const offset = (page - 1) * limit;

        // Fetch users
        const { count, rows: users } = await User.findAndCountAll({
            where,
            include: [
                { model: Role, as: 'role' },
                { model: Department, as: 'department' }
            ],
            attributes: { exclude: ['password_hash'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            users,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            include: [
                { model: Role, as: 'role' },
                { model: Department, as: 'department' }
            ],
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ user });

    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Create new user
 * POST /api/users
 */
const createUser = async (req, res) => {
    try {
        const { email, password, first_name, last_name, role_id, department_id } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(409).json({
                error: 'El correo electrónico ya está registrado'
            });
        }

        // Validate role exists
        const role = await Role.findByPk(role_id);
        if (!role) {
            return res.status(400).json({ error: 'Rol inválido' });
        }

        // Validate department if provided
        if (department_id) {
            const department = await Department.findByPk(department_id);
            if (!department) {
                return res.status(400).json({ error: 'Departamento inválido' });
            }
        }

        // Admin users should not have department
        if (role.name === 'Admin' && department_id) {
            return res.status(400).json({
                error: 'Los administradores no deben tener departamento asignado'
            });
        }

        // Non-admin users must have department
        if (role.name !== 'Admin' && !department_id) {
            return res.status(400).json({
                error: 'Los usuarios no administradores deben tener un departamento asignado'
            });
        }

        // Create user
        const user = await User.create({
            email,
            password_hash: password, // Will be hashed by beforeCreate hook
            first_name,
            last_name,
            role_id,
            department_id
        });

        // Fetch user with associations
        const createdUser = await User.findByPk(user.id, {
            include: [
                { model: Role, as: 'role' },
                { model: Department, as: 'department' }
            ],
            attributes: { exclude: ['password_hash'] }
        });

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: createdUser
        });

    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Update user
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Check if email is being changed and already exists
        if (updates.email && updates.email !== user.email) {
            const existingUser = await User.findOne({ where: { email: updates.email } });
            if (existingUser) {
                return res.status(409).json({
                    error: 'El correo electrónico ya está registrado'
                });
            }
        }

        // Validate role if being changed
        if (updates.role_id) {
            const role = await Role.findByPk(updates.role_id);
            if (!role) {
                return res.status(400).json({ error: 'Rol inválido' });
            }

            // Admin validation
            if (role.name === 'Admin' && updates.department_id) {
                return res.status(400).json({
                    error: 'Los administradores no deben tener departamento asignado'
                });
            }
        }

        // Validate department if being changed
        if (updates.department_id) {
            const department = await Department.findByPk(updates.department_id);
            if (!department) {
                return res.status(400).json({ error: 'Departamento inválido' });
            }
        }

        // Update password_hash field if password is provided
        if (updates.password) {
            updates.password_hash = updates.password;
            delete updates.password;
        }

        // Update user
        await user.update(updates);

        // Fetch updated user with associations
        const updatedUser = await User.findByPk(id, {
            include: [
                { model: Role, as: 'role' },
                { model: Department, as: 'department' }
            ],
            attributes: { exclude: ['password_hash'] }
        });

        res.json({
            message: 'Usuario actualizado exitosamente',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Delete user (soft delete - set is_active to false)
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Prevent deleting yourself
        if (user.id === req.user.id) {
            return res.status(400).json({
                error: 'No puedes desactivar tu propia cuenta'
            });
        }

        // Soft delete
        await user.update({ is_active: false });

        res.json({ message: 'Usuario desactivado exitosamente' });

    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
