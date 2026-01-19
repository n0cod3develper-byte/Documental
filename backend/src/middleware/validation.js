const Joi = require('joi');

/**
 * Middleware to validate request body against a Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Validación fallida',
                details: errors
            });
        }

        // Replace req.body with validated and sanitized value
        req.body = value;
        next();
    };
};

/**
 * Validation schemas
 */
const schemas = {
    // User schemas
    createUser: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        first_name: Joi.string().min(2).max(100).required(),
        last_name: Joi.string().min(2).max(100).required(),
        role_id: Joi.number().integer().min(1).max(3).required(),
        department_id: Joi.number().integer().min(1).allow(null)
    }),

    updateUser: Joi.object({
        email: Joi.string().email(),
        password: Joi.string().min(8),
        first_name: Joi.string().min(2).max(100),
        last_name: Joi.string().min(2).max(100),
        role_id: Joi.number().integer().min(1).max(3),
        department_id: Joi.number().integer().min(1).allow(null),
        is_active: Joi.boolean()
    }).min(1),

    // Auth schemas
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    // Department schemas
    createDepartment: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500).allow('', null)
    }),

    updateDepartment: Joi.object({
        name: Joi.string().min(2).max(100),
        description: Joi.string().max(500).allow('', null),
        is_active: Joi.boolean()
    }).min(1),

    // Folder schemas
    createFolder: Joi.object({
        name: Joi.string().min(1).max(255).required(),
        parent_folder_id: Joi.number().integer().min(1).allow(null),
        department_id: Joi.number().integer().min(1).required(),
        is_public: Joi.boolean().default(false)
    }),

    updateFolder: Joi.object({
        name: Joi.string().min(1).max(255),
        is_public: Joi.boolean()
    }).min(1),

    // Document schemas
    updateDocument: Joi.object({
        name: Joi.string().min(1).max(255),
        description: Joi.string().max(1000).allow('', null)
    }).min(1)
};

module.exports = {
    validate,
    schemas
};
