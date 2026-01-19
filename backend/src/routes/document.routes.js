const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { validate, schemas } = require('../middleware/validation');
const { auditLog } = require('../middleware/audit');
const { upload, validateFileMagicBytes, handleMulterError } = require('../middleware/upload');

/**
 * @route   GET /api/documents
 * @desc    Get all documents (filtered by department)
 * @access  Private
 */
router.get(
    '/',
    authenticateToken,
    checkPermission('document', 'read'),
    documentController.getAllDocuments
);

/**
 * @route   GET /api/documents/:id
 * @desc    Get document by ID
 * @access  Private
 */
router.get(
    '/:id',
    authenticateToken,
    checkPermission('document', 'read'),
    documentController.getDocumentById
);

/**
 * @route   POST /api/documents/upload
 * @desc    Upload document
 * @access  Private
 */
router.post(
    '/upload',
    authenticateToken,
    checkPermission('document', 'write'),
    upload.single('file'),
    handleMulterError,
    validateFileMagicBytes,
    auditLog('UPLOAD', 'document'),
    documentController.uploadDocument
);

/**
 * @route   GET /api/documents/:id/download
 * @desc    Download document
 * @access  Private
 */
router.get(
    '/:id/download',
    authenticateToken,
    checkPermission('document', 'read'),
    auditLog('DOWNLOAD', 'document'),
    documentController.downloadDocument
);

/**
 * @route   GET /api/documents/:id/preview
 * @desc    Preview document
 * @access  Private
 */
router.get(
    '/:id/preview',
    authenticateToken,
    auditLog('PREVIEW_DOCUMENT'),
    documentController.previewDocument
);

/**
 * @route   PUT /api/documents/:id
 * @desc    Update document metadata
 * @access  Private (Manager/Admin)
 */
router.put(
    '/:id',
    authenticateToken,
    requireRole('Admin', 'Manager'),
    checkPermission('document', 'write'),
    validate(schemas.updateDocument),
    auditLog('UPDATE_DOCUMENT', 'document'),
    documentController.updateDocument
);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document
 * @access  Private (Manager/Admin)
 */
router.delete(
    '/:id',
    authenticateToken,
    requireRole('Admin', 'Manager'),
    checkPermission('document', 'delete'),
    auditLog('DELETE_DOCUMENT', 'document'),
    documentController.deleteDocument
);

module.exports = router;
