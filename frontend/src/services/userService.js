import api from './api';

const userService = {
    /**
     * Get all users
     * @param {Object} params - Query parameters
     * @returns {Promise}
     */
    getUsers: async (params = {}) => {
        const response = await api.get('/users', { params });
        return response.data;
    },

    /**
     * Get user by ID
     * @param {number} id 
     * @returns {Promise}
     */
    getUserById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    /**
     * Create user
     * @param {Object} userData 
     * @returns {Promise}
     */
    createUser: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    /**
     * Update user
     * @param {number} id 
     * @param {Object} updates 
     * @returns {Promise}
     */
    updateUser: async (id, updates) => {
        const response = await api.put(`/users/${id}`, updates);
        return response.data;
    },

    /**
     * Delete user
     * @param {number} id 
     * @returns {Promise}
     */
    deleteUser: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    }
};

export default userService;
