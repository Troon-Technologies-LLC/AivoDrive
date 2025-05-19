/**
 * Trip Service
 * Handles API requests related to trip management
 */

import { apiService } from '../utils/apiUtils';
import { ENDPOINTS } from '../config/api';

/**
 * Trip service with methods for CRUD operations
 */
const tripService = {
  /**
   * Get all trips with optional filtering
   * @param {Object} params - Query parameters (page, limit, search, status, startDate, endDate)
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getTrips: async (params = {}, token) => {
    return apiService.get(ENDPOINTS.TRIPS.BASE, params, token);
  },

  /**
   * Get trip by ID
   * @param {String} id - Trip ID
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getTripById: async (id, token) => {
    return apiService.get(`${ENDPOINTS.TRIPS.BASE}/${id}`, {}, token);
  },

  /**
   * Create new trip
   * @param {Object} tripData - Trip data
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  createTrip: async (tripData, token) => {
    return apiService.post(ENDPOINTS.TRIPS.BASE, tripData, token);
  },

  /**
   * Update trip
   * @param {String} id - Trip ID
   * @param {Object} tripData - Updated trip data
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  updateTrip: async (id, tripData, token) => {
    return apiService.put(`${ENDPOINTS.TRIPS.BASE}/${id}`, tripData, token);
  },

  /**
   * Delete trip
   * @param {String} id - Trip ID
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  deleteTrip: async (id, token) => {
    return apiService.delete(`${ENDPOINTS.TRIPS.BASE}/${id}`, token);
  },

  /**
   * Get trip statistics
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getTripStats: async (token) => {
    return apiService.get(ENDPOINTS.TRIPS.STATS, {}, token);
  }
};

export default tripService;
