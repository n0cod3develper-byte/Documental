const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { validate, schemas } = require('../middleware/validation');
const { auditLog } = require('../middleware/audit');

/**
 * @route   GET /api/departments
 * @desc    Get all departments
 * @access  Private
 */
router.get(
    '/',
    authenticateToken,
    checkPermission('department', 'read'),
    departmentController.getAllDepartments
);

/**
 * @route   GET /api/departments/:id
 * @desc    Get department by ID
 * @access  Private
 */
router.get(
    '/:id',
    authenticateToken,
    checkPermission('department', 'read'),
    departmentController.getDepartmentById
);

/**
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Private (Admin only)
 */
router.post(
    '/',
    authenticateToken,
    requireRole('Admin'),
    checkPermission('department', 'write'),
    validate(schemas.createDepartment),
    auditLog('CREATE_DEPARTMENT', 'department'),
    departmentController.createDepartment
);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update department
 * @access  Private (Admin only)
 */
router.put(
    '/:id',
    authenticateToken,
    requireRole('Admin'),
    checkPermission('department', 'write'),
    validate(schemas.updateDepartment),
    auditLog('UPDATE_DEPARTMENT', 'department'),
    departmentController.updateDepartment
);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
    '/:id',
    authenticateToken,
    requireRole('Admin'),
    checkPermission('department', 'write'),
    auditLog('DELETE_DEPARTMENT', 'department'),
    departmentController.deleteDepartment
);

module.exports = router;
