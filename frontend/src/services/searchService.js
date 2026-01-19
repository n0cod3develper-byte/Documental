import api from './api';

const searchService = {
    /**
     * Perform advanced global search
     * @param {Object} params - Search filters (q, type, startDate, endDate, departmentId)
     * @returns {Promise}
     */
    search: async (params) => {
        const response = await api.get('/search', { params });
        return response.data;
    }
};

export default searchService;
