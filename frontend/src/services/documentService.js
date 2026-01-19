import api from './api';

const documentService = {
    /**
     * Get all documents
     * @param {Object} params - Query parameters
     * @returns {Promise}
     */
    getDocuments: async (params = {}) => {
        const response = await api.get('/documents', { params });
        return response.data;
    },

    /**
     * Get document by ID
     * @param {number} id 
     * @returns {Promise}
     */
    getDocumentById: async (id) => {
        const response = await api.get(`/documents/${id}`);
        return response.data;
    },

    /**
     * Upload document
     * @param {FormData} formData 
     * @returns {Promise}
     */
    uploadDocument: async (formData) => {
        const response = await api.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    /**
     * Download document
     * @param {number} id 
     * @param {string} filename 
     * @returns {Promise}
     */
    downloadDocument: async (id, filename) => {
        const response = await api.get(`/documents/${id}/download`, {
            responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    /**
     * Update document
     * @param {number} id 
     * @param {Object} updates 
     * @returns {Promise}
     */
    updateDocument: async (id, updates) => {
        const response = await api.put(`/documents/${id}`, updates);
        return response.data;
    },

    /**
     * Delete document
     * @param {number} id 
     * @returns {Promise}
     */
    deleteDocument: async (id) => {
        const response = await api.delete(`/documents/${id}`);
        return response.data;
    },

    /**
     * Get preview URL with auth token
     * @param {number} id 
     * @returns {string}
     */
    getPreviewUrl: (id) => {
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('accessToken');
        return `${baseUrl}/documents/${id}/preview?token=${token}`; // Assuming you might need query param auth for img/iframe sources if headers are hard
    }
};

export default documentService;
