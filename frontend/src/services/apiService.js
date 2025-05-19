/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

import axios from 'axios';

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5005/api';

/**
 * API service with methods for HTTP requests
 */
const apiService = {
  /**
   * Make a GET request
   * @param {String} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {String} token - Authentication token
   * @returns {Promise} Axios response
   */
  get: (endpoint, params = {}, token = null) => {
    return axios.get(`${API_BASE_URL}${endpoint}`, {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  /**
   * Make a POST request
   * @param {String} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {String} token - Authentication token
   * @returns {Promise} Axios response
   */
  post: (endpoint, data = {}, token = null) => {
    return axios.post(`${API_BASE_URL}${endpoint}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  /**
   * Make a PUT request
   * @param {String} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {String} token - Authentication token
   * @returns {Promise} Axios response
   */
  put: (endpoint, data = {}, token = null) => {
    return axios.put(`${API_BASE_URL}${endpoint}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  /**
   * Make a PATCH request
   * @param {String} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {String} token - Authentication token
   * @returns {Promise} Axios response
   */
  patch: (endpoint, data = {}, token = null) => {
    return axios.patch(`${API_BASE_URL}${endpoint}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  /**
   * Make a DELETE request
   * @param {String} endpoint - API endpoint
   * @param {String} token - Authentication token
   * @returns {Promise} Axios response
   */
  delete: (endpoint, token = null) => {
    return axios.delete(`${API_BASE_URL}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  /**
   * Upload a file
   * @param {String} endpoint - API endpoint
   * @param {FormData} formData - Form data with file
   * @param {String} token - Authentication token
   * @param {Function} onUploadProgress - Progress callback
   * @returns {Promise} Axios response
   */
  uploadFile: (endpoint, formData, token = null, onUploadProgress = null) => {
    return axios.post(`${API_BASE_URL}${endpoint}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      onUploadProgress
    });
  }
};

// Add a response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      
      // Handle 401 Unauthorized errors (token expired)
      if (error.response.status === 401) {
        // Dispatch an event that can be caught by the auth context
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiService;
