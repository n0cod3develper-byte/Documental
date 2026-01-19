import api from './api';

const departmentService = {
    /**
     * Get all departments
     * @param {Object} params - Query parameters (search, is_active)
     * @returns {Promise}
     */
    getDepartments: async (params = {}) => {
        const response = await api.get('/departments', { params });
        return response.data;
    },

    /**
     * Create new department
     * @param {Object} data - { name, description }
     * @returns {Promise}
     */
    createDepartment: async (data) => {
        const response = await api.post('/departments', data);
        return response.data;
    },

    /**
     * Update department
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise}
     */
    updateDepartment: async (id, data) => {
        const response = await api.put(`/departments/${id}`, data);
        return response.data;
    },

    /**
     * Delete (deactivate) department
     * @param {number} id 
     * @returns {Promise}
     */
    deleteDepartment: async (id) => {
        const response = await api.delete(`/departments/${id}`);
        return response.data;
    }
};

export default departmentService;
