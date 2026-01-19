const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { validate, schemas } = require('../middleware/validation');
const { auditLog } = require('../middleware/audit');

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get(
    '/',
    authenticateToken,
    requireRole('Admin'),
    checkPermission('user', 'read'),
    userController.getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get(
    '/:id',
    authenticateToken,
    requireRole('Admin'),
    checkPermission('user', 'read'),
    userController.getUserById
);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post(
    '/',
    authenticateToken,
    requireRole('Admin'),
    checkPermission('user', 'write'),
    validate(schemas.createUser),
    auditLog('CREATE_USER', 'user'),
    userController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put(
    '/:id',
    authenticateToken,
    requireRole('Admin'),
    checkPermission('user', 'write'),
    validate(schemas.updateUser),
    auditLog('UPDATE_USER', 'user'),
    userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
    '/:id',
    authenticateToken,
    requireRole('Admin'),
    checkPermission('user', 'delete'),
    auditLog('DELETE_USER', 'user'),
    userController.deleteUser
);

module.exports = router;
