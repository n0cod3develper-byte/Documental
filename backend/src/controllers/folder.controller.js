const { Folder, Department, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all folders (filtered by user's department unless Admin)
 * GET /api/folders
 */
const getAllFolders = async (req, res) => {
    try {
        const user = req.user;
        const { parent_folder_id, department_id } = req.query;

        // Build where clause
        const where = {};

        // Filter by parent folder
        if (parent_folder_id) {
            where.parent_folder_id = parent_folder_id;
        } else {
            where.parent_folder_id = null; // Root folders only
        }

        // Admin can see all departments, others only their own, public, or SHARED with them
        // Admin can see all departments, others only their own, public, or SHARED with them
        if (user.role.name === 'Admin') {
            if (department_id) {
                where.department_id = department_id;
            }
            if (parent_folder_id) {
                where.parent_folder_id = parent_folder_id;
            } else {
                where.parent_folder_id = null;
            }

            const folders = await Folder.findAll({
                where,
                include: [
                    { model: Department, as: 'department' },
                    { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
                    { model: Department, as: 'shared_with_departments' }
                ],
                order: [['name', 'ASC']]
            });
            return res.json({ folders });
        }

        // --- NON-ADMIN LOGIC ---

        if (parent_folder_id) {
            // BROWSING INSIDE A FOLDER
            // We need to check if we have access to this parent folder first? 
            // The frontend usually handles navigation.
            // We just return children that are visible.

            // Children can be seen if:
            // 1. They belong to my department
            // 2. They are public
            // 3. They are shared with my department
            // 4. (Implied) If I can see the parent, I can likely see the children if they inherit? 
            //    Our current model doesn't explicitly inherit permissions 
            //    but usually public/dept logic applies to the item itself.
            //    Let's stick to: I see children that match my access rules.

            const children = await Folder.findAll({
                where: {
                    parent_folder_id,
                    [Op.or]: [
                        { department_id: user.department_id },
                        { is_public: true },
                        { '$shared_with_departments.id$': user.department_id }
                    ]
                },
                include: [
                    { model: Department, as: 'department' },
                    { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
                    {
                        model: Department,
                        as: 'shared_with_departments',
                        required: false
                    }
                ],
                order: [['name', 'ASC']]
            });
            return res.json({ folders: children });

        } else {
            // ROOT VIEW (parent_folder_id is null/undefined)
            // We want to see:
            // 1. Root folders of my department
            // 2. Public root folders
            // 3. ANY folder (root or subfolder) that is explicitly shared with my department

            // Query 1: Standard Roots
            const standardRoots = await Folder.findAll({
                where: {
                    parent_folder_id: null,
                    [Op.or]: [
                        { department_id: user.department_id },
                        { is_public: true }
                    ]
                },
                include: [
                    { model: Department, as: 'department' },
                    { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
                    { model: Department, as: 'shared_with_departments' }
                ]
            });

            // Query 2: Explicitly Shared With Me (ANY LEVEL)
            const sharedWithMe = await Folder.findAll({
                include: [
                    { model: Department, as: 'department' },
                    { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
                    {
                        model: Department,
                        as: 'shared_with_departments',
                        where: { id: user.department_id }, // INNER JOIN with my dept constraint
                        required: true
                    }
                ]
            });

            // Merge and deduplicate
            const folderMap = new Map();

            standardRoots.forEach(f => folderMap.set(f.id, f));
            sharedWithMe.forEach(f => {
                // Determine if we should show this shared folder at root.
                // If it's already in standardRoots, it's there.
                // If it's a subfolder, we show it at root so the user can see it!
                if (!folderMap.has(f.id)) {
                    folderMap.set(f.id, f);
                }
            });

            const finalFolders = Array.from(folderMap.values()).sort((a, b) => a.name.localeCompare(b.name));

            return res.json({ folders: finalFolders });
        }

    } catch (error) {
        console.error('Error obteniendo carpetas:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Get folder by ID with subfolders and documents
 * GET /api/folders/:id
 */
const getFolderById = async (req, res) => {
    try {
        const { id } = req.params;

        const folder = await Folder.findByPk(id, {
            include: [
                { model: Department, as: 'department' },
                { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: Department, as: 'shared_with_departments' }, // Include shared info
                {
                    model: Folder,
                    as: 'subfolders',
                    include: [{ model: User, as: 'creator', attributes: ['first_name', 'last_name'] }]
                }
            ]
        });

        if (!folder) {
            return res.status(404).json({ error: 'Carpeta no encontrada' });
        }

        res.json({ folder });

    } catch (error) {
        console.error('Error obteniendo carpeta:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Create new folder
 * POST /api/folders
 */
const createFolder = async (req, res) => {
    try {
        console.log('CREATE FOLDER BODY:', req.body);
        const { name, parent_folder_id, department_id, is_public, shared_departments } = req.body;
        const user = req.user;

        // Validate department
        const department = await Department.findByPk(department_id);
        if (!department || !department.is_active) {
            return res.status(400).json({ error: 'Departamento inválido o inactivo' });
        }

        // Non-admin users can only create folders in their department
        if (user.role.name !== 'Admin' && department_id !== user.department_id) {
            return res.status(403).json({
                error: 'Solo puedes crear carpetas en tu departamento'
            });
        }

        // If parent folder exists, validate it
        if (parent_folder_id) {
            const parentFolder = await Folder.findByPk(parent_folder_id);

            if (!parentFolder) {
                return res.status(404).json({ error: 'Carpeta padre no encontrada' });
            }

            // Parent folder must be in the same department
            if (parentFolder.department_id !== department_id) {
                return res.status(400).json({
                    error: 'La carpeta padre debe estar en el mismo departamento'
                });
            }
        }

        // Check for duplicate folder name in same parent
        const existingFolder = await Folder.findOne({
            where: {
                name,
                parent_folder_id: parent_folder_id || null,
                department_id
            }
        });

        if (existingFolder) {
            return res.status(409).json({
                error: 'Ya existe una carpeta con ese nombre en esta ubicación'
            });
        }

        const folder = await Folder.create({
            name,
            parent_folder_id,
            department_id,
            created_by: user.id,
            is_public: is_public || false
        });

        // Set shared departments if any
        if (shared_departments && Array.isArray(shared_departments) && shared_departments.length > 0) {
            await folder.setShared_with_departments(shared_departments);
        }

        // Fetch created folder with associations
        const createdFolder = await Folder.findByPk(folder.id, {
            include: [
                { model: Department, as: 'department' },
                { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: Department, as: 'shared_with_departments' }
            ]
        });

        res.status(201).json({
            message: 'Carpeta creada exitosamente',
            folder: createdFolder
        });

    } catch (error) {
        console.error('Error creando carpeta:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Update folder
 * PUT /api/folders/:id
 */
const updateFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const folder = await Folder.findByPk(id);

        if (!folder) {
            return res.status(404).json({ error: 'Carpeta no encontrada' });
        }

        // Check if name is being changed and already exists
        if (updates.name && updates.name !== folder.name) {
            const existingFolder = await Folder.findOne({
                where: {
                    name: updates.name,
                    parent_folder_id: folder.parent_folder_id,
                    department_id: folder.department_id,
                    id: { [Op.ne]: id }
                }
            });

            if (existingFolder) {
                return res.status(409).json({
                    error: 'Ya existe una carpeta con ese nombre en esta ubicación'
                });
            }
        }

        await folder.update(updates);

        if (updates.shared_departments && Array.isArray(updates.shared_departments)) {
            await folder.setShared_with_departments(updates.shared_departments);
        }

        const updatedFolder = await Folder.findByPk(id, {
            include: [
                { model: Department, as: 'department' },
                { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: Department, as: 'shared_with_departments' }
            ]
        });

        res.json({
            message: 'Carpeta actualizada exitosamente',
            folder: updatedFolder
        });

    } catch (error) {
        console.error('Error actualizando carpeta:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Delete folder (cascades to subfolders and documents)
 * DELETE /api/folders/:id
 */
const deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;

        const folder = await Folder.findByPk(id);

        if (!folder) {
            return res.status(404).json({ error: 'Carpeta no encontrada' });
        }

        // Delete folder (cascade will handle subfolders and documents)
        await folder.destroy();

        res.json({ message: 'Carpeta eliminada exitosamente' });

    } catch (error) {
        console.error('Error eliminando carpeta:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    getAllFolders,
    getFolderById,
    createFolder,
    updateFolder,
    deleteFolder
};
