const { Op } = require('sequelize');
const { Document, Folder, User, Department } = require('../models');

const searchController = {
    /**
     * Advanced global search
     * @param {Object} req 
     * @param {Object} res 
     */
    globalSearch: async (req, res) => {
        try {
            const {
                q,
                type = 'all',
                startDate,
                endDate,
                departmentId,
                mimeType
            } = req.query;

            console.log('--- Search Request ---');
            console.log('Query:', q);
            console.log('Filters:', { type, startDate, endDate, departmentId });
            console.log('User Role:', req.user.role.name);

            if (!q) {
                return res.status(400).json({ error: 'Search query is required' });
            }

            const user = req.user;
            const results = {
                documents: [],
                folders: []
            };

            // --- Search Folders ---
            if (type === 'all' || type === 'folder') {
                const folderWhere = {
                    name: { [Op.iLike]: `%${q}%` }
                };

                // Security Filter for Folders
                if (user.role.name !== 'Admin') {
                    // Users see folders in their department OR public folders (if logic existed)
                    // For now, strict department isolation + created by user as fallback if needed
                    folderWhere.department_id = user.department_id;
                } else if (departmentId) {
                    folderWhere.department_id = departmentId;
                }

                if (startDate || endDate) {
                    const dateFilter = {};
                    // PostgreSQL dates can be tricky. Using start of day / end of day helps.
                    if (startDate) dateFilter[Op.gte] = new Date(startDate);
                    if (endDate) {
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        dateFilter[Op.lte] = end;
                    }
                    if (startDate || endDate) folderWhere.created_at = dateFilter;
                }

                console.log('Folder Where Clause:', JSON.stringify(folderWhere, null, 2));

                results.folders = await Folder.findAll({
                    where: folderWhere,
                    include: [
                        { model: Department, as: 'department' },
                        { model: User, as: 'creator', attributes: ['first_name', 'last_name'] }
                    ],
                    limit: 20,
                    order: [['created_at', 'DESC']]
                });
                console.log(`Found ${results.folders.length} folders`);
            }

            // --- Search Documents ---
            if (type === 'all' || type === 'document') {
                const docWhere = {
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${q}%` } },
                        { description: { [Op.iLike]: `%${q}%` } },
                        { original_name: { [Op.iLike]: `%${q}%` } }
                    ]
                };

                if (startDate || endDate) {
                    const dateFilter = {};
                    if (startDate) dateFilter[Op.gte] = new Date(startDate);
                    if (endDate) {
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        dateFilter[Op.lte] = end;
                    }
                    if (startDate || endDate) docWhere.created_at = dateFilter;
                }

                if (mimeType) {
                    docWhere.mime_type = { [Op.iLike]: `%${mimeType}%` };
                }

                // Parent Folder Includes for Security
                const folderInclude = {
                    model: Folder,
                    as: 'folder',
                    include: [{ model: Department, as: 'department' }]
                };

                // Apply RBAC to the Folder Include
                if (user.role.name !== 'Admin') {
                    folderInclude.where = { department_id: user.department_id };
                } else if (departmentId) {
                    folderInclude.where = { department_id: departmentId };
                }

                console.log('Doc Where Clause:', JSON.stringify(docWhere, null, 2));

                results.documents = await Document.findAll({
                    where: docWhere,
                    include: [
                        folderInclude,
                        {
                            model: User,
                            as: 'uploader',
                            attributes: ['first_name', 'last_name', 'email']
                        }
                    ],
                    limit: 20,
                    order: [['created_at', 'DESC']]
                });
                console.log(`Found ${results.documents.length} documents`);
            }

            return res.json({
                query: q,
                filters: { type, startDate, endDate, departmentId, mimeType },
                results
            });

        } catch (error) {
            console.error('Search error details:', error);
            return res.status(500).json({ error: 'Error performing search', details: error.message });
        }
    }
};

module.exports = searchController;
