import api from './api';

const folderService = {
    /**
     * Get all folders
     * @param {Object} params - Query parameters
     * @returns {Promise}
     */
    getFolders: async (params = {}) => {
        const response = await api.get('/folders', { params });
        return response.data;
    },

    /**
     * Get folder by ID
     * @param {number} id 
     * @returns {Promise}
     */
    getFolderById: async (id) => {
        const response = await api.get(`/folders/${id}`);
        return response.data;
    },

    /**
     * Create folder
     * @param {Object} folderData 
     * @returns {Promise}
     */
    createFolder: async (folderData) => {
        const response = await api.post('/folders', folderData);
        return response.data;
    },

    /**
     * Update folder
     * @param {number} id 
     * @param {Object} updates 
     * @returns {Promise}
     */
    updateFolder: async (id, updates) => {
        const response = await api.put(`/folders/${id}`, updates);
        return response.data;
    },

    /**
     * Delete folder
     * @param {number} id 
     * @returns {Promise}
     */
    deleteFolder: async (id) => {
        const response = await api.delete(`/folders/${id}`);
        return response.data;
    }
};

export default folderService;
