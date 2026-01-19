const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folder.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkPermission, checkFolderAccess } = require('../middleware/rbac');
const { validate, schemas } = require('../middleware/validation');
const { auditLog } = require('../middleware/audit');

/**
 * @route   GET /api/folders
 * @desc    Get all folders (filtered by department)
 * @access  Private
 */
router.get(
    '/',
    authenticateToken,
    checkPermission('folder', 'read'),
    folderController.getAllFolders
);

/**
 * @route   GET /api/folders/:id
 * @desc    Get folder by ID with subfolders
 * @access  Private
 */
router.get(
    '/:id',
    authenticateToken,
    checkPermission('folder', 'read'),
    checkFolderAccess,
    folderController.getFolderById
);

/**
 * @route   POST /api/folders
 * @desc    Create new folder
 * @access  Private (Manager/Admin)
 */
router.post(
    '/',
    authenticateToken,
    requireRole('Admin', 'Manager'),
    checkPermission('folder', 'write'),
    validate(schemas.createFolder),
    auditLog('CREATE_FOLDER', 'folder'),
    folderController.createFolder
);

/**
 * @route   PUT /api/folders/:id
 * @desc    Update folder
 * @access  Private (Manager/Admin)
 */
router.put(
    '/:id',
    authenticateToken,
    requireRole('Admin', 'Manager'),
    checkPermission('folder', 'write'),
    checkFolderAccess,
    validate(schemas.updateFolder),
    auditLog('UPDATE_FOLDER', 'folder'),
    folderController.updateFolder
);

/**
 * @route   DELETE /api/folders/:id
 * @desc    Delete folder
 * @access  Private (Manager/Admin)
 */
router.delete(
    '/:id',
    authenticateToken,
    requireRole('Admin', 'Manager'),
    checkPermission('folder', 'delete'),
    checkFolderAccess,
    auditLog('DELETE_FOLDER', 'folder'),
    folderController.deleteFolder
);

module.exports = router;
