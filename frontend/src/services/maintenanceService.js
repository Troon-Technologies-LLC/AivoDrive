/**
 * Maintenance Service
 * Handles API requests related to vehicle maintenance management
 */

import { apiService } from '../utils/apiUtils';
import { ENDPOINTS } from '../config/api';

/**
 * Maintenance service with methods for CRUD operations
 */
const maintenanceService = {
  /**
   * Get all maintenance records with optional filtering
   * @param {Object} params - Query parameters (page, limit, search, status, startDate, endDate)
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getMaintenanceRecords: async (params = {}, token) => {
    return apiService.get(ENDPOINTS.MAINTENANCE.BASE, params, token);
  },

  /**
   * Get maintenance record by ID
   * @param {String} id - Maintenance record ID
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getMaintenanceById: async (id, token) => {
    return apiService.get(`${ENDPOINTS.MAINTENANCE.BASE}/${id}`, {}, token);
  },

  /**
   * Create new maintenance record
   * @param {Object} maintenanceData - Maintenance record data
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  createMaintenance: async (maintenanceData, token) => {
    return apiService.post(ENDPOINTS.MAINTENANCE.BASE, maintenanceData, token);
  },

  /**
   * Update maintenance record
   * @param {String} id - Maintenance record ID
   * @param {Object} maintenanceData - Updated maintenance record data
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  updateMaintenance: async (id, maintenanceData, token) => {
    return apiService.put(`${ENDPOINTS.MAINTENANCE.BASE}/${id}`, maintenanceData, token);
  },

  /**
   * Delete maintenance record
   * @param {String} id - Maintenance record ID
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  deleteMaintenance: async (id, token) => {
    return apiService.delete(`${ENDPOINTS.MAINTENANCE.BASE}/${id}`, token);
  },

  /**
   * Get maintenance statistics
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getMaintenanceStats: async (token) => {
    return apiService.get(ENDPOINTS.MAINTENANCE.STATS, {}, token);
  }
};

export default maintenanceService;
