/**
 * API Utilities
 * Helper functions for API requests with authentication and error handling
 */

import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';

/**
 * Create an axios instance with default configuration
 * @returns {Object} Configured axios instance
 */
const createApiClient = (token = null) => {
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });

  // Add request interceptor
  apiClient.interceptors.request.use(
    (config) => {
      // You can modify the request config here (e.g., add loading state)
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor
  apiClient.interceptors.response.use(
    (response) => {
      // Handle successful responses
      return response.data;
    },
    (error) => {
      // Handle error responses
      const customError = {
        message: error.response?.data?.message || 'Something went wrong',
        status: error.response?.status || 500,
        data: error.response?.data || {}
      };
      return Promise.reject(customError);
    }
  );

  return apiClient;
};

/**
 * API service with methods for CRUD operations
 */
export const apiService = {
  /**
   * Get data from API
   * @param {String} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  get: async (endpoint, params = {}, token = null) => {
    const apiClient = createApiClient(token);
    return apiClient.get(endpoint, { params });
  },

  /**
   * Post data to API
   * @param {String} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  post: async (endpoint, data = {}, token = null) => {
    const apiClient = createApiClient(token);
    return apiClient.post(endpoint, data);
  },

  /**
   * Update data via API
   * @param {String} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  put: async (endpoint, data = {}, token = null) => {
    const apiClient = createApiClient(token);
    return apiClient.put(endpoint, data);
  },

  /**
   * Delete data via API
   * @param {String} endpoint - API endpoint
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  delete: async (endpoint, token = null) => {
    const apiClient = createApiClient(token);
    return apiClient.delete(endpoint);
  }
};

/**
 * Format query parameters for API requests
 * @param {Object} params - Query parameters object
 * @returns {String} Formatted query string
 */
export const formatQueryParams = (params) => {
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

/**
 * Handle API errors
 * @param {Object} error - Error object
 * @returns {Object} Formatted error object
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);
  return {
    message: error.message || 'Something went wrong',
    status: error.status || 500,
    data: error.data || {}
  };
};
