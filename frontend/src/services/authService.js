/**
 * Authentication Service
 * Handles API requests related to authentication
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

/**
 * Authentication service with methods for login, profile, etc.
 */
const authService = {
  /**
   * Login user
   * @param {Object} credentials - User credentials (email, password)
   * @returns {Promise} API response
   */
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  },

  /**
   * Get user profile
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getProfile: async (token) => {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  /**
   * Update user profile
   * @param {String} token - JWT token
   * @param {Object} userData - Updated user data
   * @returns {Promise} API response
   */
  updateProfile: async (token, userData) => {
    const response = await axios.put(`${API_BASE_URL}/auth/profile`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default authService;
