/**
 * Fuel Service
 * Handles API interactions for fuel management
 */

import apiService from './apiService';
import { ENDPOINTS } from '../constants/endpoints';

/**
 * Service for handling fuel-related API requests
 */
const fuelService = {
  /**
   * Get all fuel records with optional filtering
   * @param {Object} params - Query parameters for filtering
   * @param {String} token - Authentication token
   * @returns {Promise} API response
   */
  getFuelRecords: (params, token) => {
    return apiService.get(ENDPOINTS.FUEL.BASE, params, token);
  },

  /**
   * Get fuel record by ID
   * @param {String} id - Fuel record ID
   * @param {String} token - Authentication token
   * @returns {Promise} API response
   */
  getFuelById: (id, token) => {
    return apiService.get(`${ENDPOINTS.FUEL.BASE}/${id}`, {}, token);
  },

  /**
   * Create a new fuel record
   * @param {Object} data - Fuel record data
   * @param {String} token - Authentication token
   * @returns {Promise} API response
   */
  createFuel: (data, token) => {
    return apiService.post(ENDPOINTS.FUEL.BASE, data, token);
  },

  /**
   * Update an existing fuel record
   * @param {String} id - Fuel record ID
   * @param {Object} data - Updated fuel record data
   * @param {String} token - Authentication token
   * @returns {Promise} API response
   */
  updateFuel: (id, data, token) => {
    return apiService.put(`${ENDPOINTS.FUEL.BASE}/${id}`, data, token);
  },

  /**
   * Delete a fuel record
   * @param {String} id - Fuel record ID
   * @param {String} token - Authentication token
   * @returns {Promise} API response
   */
  deleteFuel: (id, token) => {
    return apiService.delete(`${ENDPOINTS.FUEL.BASE}/${id}`, token);
  },

  /**
   * Get fuel statistics
   * @param {String} token - Authentication token
   * @returns {Promise} API response
   */
  getFuelStats: (token) => {
    return apiService.get(ENDPOINTS.FUEL.STATS, {}, token);
  },

  /**
   * Get fuel records for a specific vehicle
   * @param {String} vehicleId - Vehicle ID
   * @param {Object} params - Query parameters for filtering
   * @param {String} token - Authentication token
   * @returns {Promise} API response
   */
  getVehicleFuelRecords: (vehicleId, params, token) => {
    return apiService.get(`${ENDPOINTS.VEHICLES.BASE}/${vehicleId}/fuel`, params, token);
  },

  /**
   * Get fuel efficiency report
   * @param {Object} params - Query parameters for filtering
   * @param {String} token - Authentication token
   * @returns {Promise} API response
   */
  getFuelEfficiencyReport: (params, token) => {
    return apiService.get(ENDPOINTS.FUEL.EFFICIENCY_REPORT, params, token);
  }
};

export default fuelService;
