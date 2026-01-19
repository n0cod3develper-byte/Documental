const { Department } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all departments
 * GET /api/departments
 */
const getAllDepartments = async (req, res) => {
    try {
        const { search, is_active } = req.query;

        // Build where clause
        const where = {};

        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }

        if (is_active !== undefined) {
            where.is_active = is_active === 'true';
        }

        const departments = await Department.findAll({
            where,
            order: [['name', 'ASC']]
        });

        res.json({ departments });

    } catch (error) {
        console.error('Error obteniendo departamentos:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Get department by ID
 * GET /api/departments/:id
 */
const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await Department.findByPk(id);

        if (!department) {
            return res.status(404).json({ error: 'Departamento no encontrado' });
        }

        res.json({ department });

    } catch (error) {
        console.error('Error obteniendo departamento:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Create new department
 * POST /api/departments
 */
const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if department name already exists
        const existingDept = await Department.findOne({ where: { name } });

        if (existingDept) {
            return res.status(409).json({
                error: 'Ya existe un departamento con ese nombre'
            });
        }

        const department = await Department.create({
            name,
            description
        });

        res.status(201).json({
            message: 'Departamento creado exitosamente',
            department
        });

    } catch (error) {
        console.error('Error creando departamento:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Update department
 * PUT /api/departments/:id
 */
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const department = await Department.findByPk(id);

        if (!department) {
            return res.status(404).json({ error: 'Departamento no encontrado' });
        }

        // Check if name is being changed and already exists
        if (updates.name && updates.name !== department.name) {
            const existingDept = await Department.findOne({ where: { name: updates.name } });
            if (existingDept) {
                return res.status(409).json({
                    error: 'Ya existe un departamento con ese nombre'
                });
            }
        }

        await department.update(updates);

        res.json({
            message: 'Departamento actualizado exitosamente',
            department
        });

    } catch (error) {
        console.error('Error actualizando departamento:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Delete department (soft delete)
 * DELETE /api/departments/:id
 */
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await Department.findByPk(id);

        if (!department) {
            return res.status(404).json({ error: 'Departamento no encontrado' });
        }

        // Soft delete
        await department.update({ is_active: false });

        res.json({ message: 'Departamento desactivado exitosamente' });

    } catch (error) {
        console.error('Error eliminando departamento:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
