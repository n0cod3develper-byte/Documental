const { AuditLog } = require('../models');

/**
 * Create audit log entry
 * @param {Object} data - Audit log data
 */
const createAuditLog = async (data) => {
    try {
        await AuditLog.create(data);
    } catch (error) {
        console.error('Error creando log de auditoría:', error);
        // Don't throw error - auditing shouldn't break the main flow
    }
};

/**
 * Middleware to automatically log actions
 * @param {string} action - Action being performed
 * @param {string} resourceType - Type of resource
 */
const auditLog = (action, resourceType) => {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.send;

        // Override send function to capture response
        res.send = function (data) {
            // Only log successful operations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const resourceId = req.params.id ||
                    req.body.id ||
                    (typeof data === 'object' && data.id) ||
                    0;

                const resourceName = req.body.name ||
                    req.body.original_name ||
                    (typeof data === 'object' && data.name) ||
                    null;

                createAuditLog({
                    user_id: req.user ? req.user.id : null,
                    action: action,
                    resource_type: resourceType,
                    resource_id: resourceId,
                    resource_name: resourceName,
                    ip_address: req.ip || req.connection.remoteAddress,
                    user_agent: req.headers['user-agent']
                });
            }

            // Call original send
            originalSend.call(this, data);
        };

        next();
    };
};

/**
 * Log authentication attempts
 */
const logAuth = async (userId, action, success, req) => {
    await createAuditLog({
        user_id: userId || 0,
        action: success ? action : `${action}_FAILED`,
        resource_type: 'auth',
        resource_id: userId || 0,
        resource_name: null,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent']
    });
};

/**
 * Log unauthorized access attempts
 */
const logUnauthorizedAccess = async (req, resourceType, resourceId) => {
    if (req.user) {
        await createAuditLog({
            user_id: req.user.id,
            action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
            resource_type: resourceType,
            resource_id: resourceId || 0,
            resource_name: null,
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.headers['user-agent']
        });
    }
};

module.exports = {
    createAuditLog,
    auditLog,
    logAuth,
    logUnauthorizedAccess
};
