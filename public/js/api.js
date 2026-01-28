/**
 * API Module
 * Handles all API requests to the backend
 */

const API = {
    baseURL: window.location.origin,

    /**
     * Fetch all reports data
     */
    async getReports() {
        try {
            const response = await fetch(`${this.baseURL}/api/reports`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching reports:', error);
            throw error;
        }
    },

    /**
     * Fetch list of projects
     */
    async getProjects() {
        try {
            const response = await fetch(`${this.baseURL}/api/projects`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
    },

    /**
     * Check API health
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/api/health`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error checking health:', error);
            throw error;
        }
    }
};

// Export for use in other modules
window.API = API;
