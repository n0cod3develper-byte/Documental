const { Permission, Folder, Department } = require('../models');

/**
 * Check if user has permission for a specific action on a resource type
 * @param {string} resourceType - Type of resource (folder, document, user, etc.)
 * @param {string} action - Action to perform (read, write, delete)
 */
const checkPermission = (resourceType, action) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            const user = req.user;

            // Check if user's role has the required permission
            const hasPermission = await Permission.findOne({
                where: {
                    role_id: user.role_id,
                    resource_type: resourceType,
                    action: action
                }
            });

            if (!hasPermission) {
                return res.status(403).json({
                    error: 'Permiso denegado',
                    required: `${action} on ${resourceType}`,
                    role: user.role.name
                });
            }

            next();
        } catch (error) {
            console.error('Error verificando permisos:', error);
            return res.status(500).json({ error: 'Error verificando permisos' });
        }
    };
};

/**
 * Check if user has access to a specific department
 * Admin has access to all departments
 * Others only to their own department or public resources
 */
const checkDepartmentAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        const user = req.user;

        // Admin has access to everything
        if (user.role.name === 'Admin') {
            return next();
        }

        // Get department_id from request (could be in params, body, or query)
        const departmentId = req.params.departmentId ||
            req.body.department_id ||
            req.query.department_id;

        if (!departmentId) {
            return res.status(400).json({ error: 'ID de departamento requerido' });
        }

        // Check if user belongs to this department
        if (parseInt(departmentId) !== user.department_id) {
            return res.status(403).json({
                error: 'Acceso denegado a este departamento'
            });
        }

        next();
    } catch (error) {
        console.error('Error verificando acceso a departamento:', error);
        return res.status(500).json({ error: 'Error verificando acceso' });
    }
};

/**
 * Check if user has access to a specific folder
 * Validates department ownership and public flag
 */
const checkFolderAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        const user = req.user;
        const folderId = req.params.id || req.params.folderId || req.body.folder_id;

        if (!folderId) {
            return res.status(400).json({ error: 'ID de carpeta requerido' });
        }

        // Admin has access to everything
        if (user.role.name === 'Admin') {
            return next();
        }

        // Get folder with department
        const folder = await Folder.findByPk(folderId, {
            include: [{ model: Department, as: 'department' }]
        });

        if (!folder) {
            return res.status(404).json({ error: 'Carpeta no encontrada' });
        }

        // Check if folder is public or belongs to user's department
        if (!folder.is_public && folder.department_id !== user.department_id) {
            return res.status(403).json({
                error: 'Acceso denegado a esta carpeta'
            });
        }

        // Attach folder to request for later use
        req.folder = folder;
        next();

    } catch (error) {
        console.error('Error verificando acceso a carpeta:', error);
        return res.status(500).json({ error: 'Error verificando acceso' });
    }
};

/**
 * Combined permission and department access check
 * @param {string} resourceType - Type of resource
 * @param {string} action - Action to perform
 */
const authorize = (resourceType, action) => {
    return [
        checkPermission(resourceType, action),
        // Additional checks can be added here based on resource type
    ];
};

module.exports = {
    checkPermission,
    checkDepartmentAccess,
    checkFolderAccess,
    authorize
};
