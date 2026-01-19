const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const { authenticateToken } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');

/**
 * @route   GET /api/search
 * @desc    Global advanced search
 * @access  Private
 */
router.get(
    '/',
    authenticateToken,
    auditLog('SEARCH', 'system'), // Log search actions
    searchController.globalSearch
);

module.exports = router;
