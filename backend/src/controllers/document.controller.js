const { Document, Folder, User, Department } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get all documents (filtered by user's department unless Admin)
 * GET /api/documents
 */
const getAllDocuments = async (req, res) => {
    try {
        const user = req.user;
        const { folder_id, search, page = 1, limit = 20 } = req.query;

        // Build where clause
        const where = {};

        if (folder_id) {
            where.folder_id = folder_id;
        }

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { original_name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Calculate pagination
        const offset = (page - 1) * limit;

        // Fetch documents with folder and department info
        const { count, rows: documents } = await Document.findAndCountAll({
            where,
            include: [
                {
                    model: Folder,
                    as: 'folder',
                    include: [{ model: Department, as: 'department' }],
                    // Filter by department access
                    where: user.role.name === 'Admin' ? {} : {
                        [Op.or]: [
                            { department_id: user.department_id },
                            { is_public: true }
                        ]
                    }
                },
                { model: User, as: 'uploader', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            documents,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Error obteniendo documentos:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Get document by ID
 * GET /api/documents/:id
 */
const getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findByPk(id, {
            include: [
                {
                    model: Folder,
                    as: 'folder',
                    include: [{ model: Department, as: 'department' }]
                },
                { model: User, as: 'uploader', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ]
        });

        if (!document) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        res.json({ document });

    } catch (error) {
        console.error('Error obteniendo documento:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Upload document
 * POST /api/documents/upload
 */
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
        }

        const { folder_id, name, description } = req.body;
        const user = req.user;

        // Validate folder exists
        const folder = await Folder.findByPk(folder_id, {
            include: [{ model: Department, as: 'department' }]
        });

        if (!folder) {
            // Delete uploaded file
            await fs.unlink(req.file.path);
            return res.status(404).json({ error: 'Carpeta no encontrada' });
        }

        // Check folder access
        if (user.role.name !== 'Admin') {
            if (folder.department_id !== user.department_id && !folder.is_public) {
                // Delete uploaded file
                await fs.unlink(req.file.path);
                return res.status(403).json({
                    error: 'No tienes acceso a esta carpeta'
                });
            }
        }

        // Create document record
        const document = await Document.create({
            name: name || req.file.originalname,
            original_name: req.file.originalname,
            file_path: req.file.path,
            file_size: req.file.size,
            mime_type: req.file.mimetype,
            extension: path.extname(req.file.originalname).toLowerCase(),
            folder_id,
            uploaded_by: user.id,
            description: description || null
        });

        // Fetch created document with associations
        const createdDocument = await Document.findByPk(document.id, {
            include: [
                {
                    model: Folder,
                    as: 'folder',
                    include: [{ model: Department, as: 'department' }]
                },
                { model: User, as: 'uploader', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ]
        });

        res.status(201).json({
            message: 'Documento subido exitosamente',
            document: createdDocument
        });

    } catch (error) {
        console.error('Error subiendo documento:', error);

        // Try to delete file if it was uploaded
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error eliminando archivo:', unlinkError);
            }
        }

        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Download document
 * GET /api/documents/:id/download
 */
const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const document = await Document.findByPk(id, {
            include: [
                {
                    model: Folder,
                    as: 'folder',
                    include: [{ model: Department, as: 'department' }]
                }
            ]
        });

        if (!document) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        // Check access
        if (user.role.name !== 'Admin') {
            if (document.folder.department_id !== user.department_id && !document.folder.is_public) {
                return res.status(403).json({
                    error: 'No tienes acceso a este documento'
                });
            }
        }

        // Check if file exists
        try {
            await fs.access(document.file_path);
        } catch (error) {
            return res.status(404).json({
                error: 'Archivo no encontrado en el servidor'
            });
        }

        // Send file
        res.download(document.file_path, document.original_name, (err) => {
            if (err) {
                console.error('Error descargando archivo:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Error descargando archivo' });
                }
            }
        });

    } catch (error) {
        console.error('Error en descarga:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Preview document (stream for browser view)
 * GET /api/documents/:id/preview
 */
const previewDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const document = await Document.findByPk(id, {
            include: [
                {
                    model: Folder,
                    as: 'folder',
                    include: [{ model: Department, as: 'department' }]
                }
            ]
        });

        if (!document) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        // Check access
        if (user.role.name !== 'Admin') {
            if (document.folder.department_id !== user.department_id && !document.folder.is_public) {
                return res.status(403).json({
                    error: 'No tienes acceso a este documento'
                });
            }
        }

        // Check file exists
        try {
            await fs.access(document.file_path);
        } catch (error) {
            return res.status(404).json({
                error: 'Archivo no encontrado en el servidor'
            });
        }

        // Send file with inline disposition
        res.sendFile(path.resolve(document.file_path), {
            headers: {
                'Content-Type': document.mime_type,
                'Content-Disposition': `inline; filename="${document.original_name}"`
            }
        }, (err) => {
            if (err) {
                console.error('Error enviando archivo para previsualización:', err);
                if (!res.headersSent) res.status(500).end();
            }
        });

    } catch (error) {
        console.error('Error en previsualización:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Update document metadata
 * PUT /api/documents/:id
 */
const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const document = await Document.findByPk(id);

        if (!document) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        await document.update(updates);

        const updatedDocument = await Document.findByPk(id, {
            include: [
                {
                    model: Folder,
                    as: 'folder',
                    include: [{ model: Department, as: 'department' }]
                },
                { model: User, as: 'uploader', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ]
        });

        res.json({
            message: 'Documento actualizado exitosamente',
            document: updatedDocument
        });

    } catch (error) {
        console.error('Error actualizando documento:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Delete document
 * DELETE /api/documents/:id
 */
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findByPk(id);

        if (!document) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        // Delete physical file
        try {
            await fs.unlink(document.file_path);
        } catch (error) {
            console.error('Error eliminando archivo físico:', error);
            // Continue with database deletion even if file deletion fails
        }

        // Delete database record
        await document.destroy();

        res.json({ message: 'Documento eliminado exitosamente' });

    } catch (error) {
        console.error('Error eliminando documento:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    getAllDocuments,
    getDocumentById,
    uploadDocument,
    downloadDocument,
    updateDocument,
    deleteDocument,
    previewDocument
};
