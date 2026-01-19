import api from './api';

const authService = {
    /**
     * Login user
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise}
     */
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });

        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    /**
     * Logout user
     * @returns {Promise}
     */
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },

    /**
     * Get current user
     * @returns {Promise}
     */
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data.user;
    },

    /**
     * Get stored user from localStorage
     * @returns {Object|null}
     */
    getStoredUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('accessToken');
    }
};

export default authService;
