/**
 * Driver Service
 * Handles API requests related to driver management with integrated notifications
 */

import { apiService } from '../utils/apiUtils';
import { ENDPOINTS } from '../config/api';
import notificationService from './notificationService';

/**
 * Driver service with methods for CRUD operations
 * Each method includes success and error notifications
 */
const driverService = {
  /**
   * Get all drivers with optional filtering
   * @param {Object} params - Query parameters (page, limit, search, status)
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getDrivers: async (params = {}, token) => {
    try {
      const response = await apiService.get(ENDPOINTS.DRIVERS.BASE, params, token);
      return response;
    } catch (error) {
      notificationService.showError('Failed to fetch drivers', error);
      throw error;
    }
  },

  /**
   * Get driver by ID
   * @param {String} id - Driver ID
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getDriverById: async (id, token) => {
    try {
      const response = await apiService.get(`${ENDPOINTS.DRIVERS.BASE}/${id}`, {}, token);
      return response;
    } catch (error) {
      notificationService.showError('Failed to fetch driver details', error);
      throw error;
    }
  },

  /**
   * Create new driver
   * @param {Object} driverData - Driver data
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  createDriver: async (driverData, token) => {
    try {
      const response = await apiService.post(ENDPOINTS.DRIVERS.BASE, driverData, token);
      notificationService.showSuccess('Driver created successfully');
      return response;
    } catch (error) {
      notificationService.showError('Failed to create driver', error);
      throw error;
    }
  },

  /**
   * Update driver
   * @param {String} id - Driver ID
   * @param {Object} driverData - Updated driver data
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  updateDriver: async (id, driverData, token) => {
    try {
      const response = await apiService.put(`${ENDPOINTS.DRIVERS.BASE}/${id}`, driverData, token);
      notificationService.showSuccess('Driver updated successfully');
      return response;
    } catch (error) {
      notificationService.showError('Failed to update driver', error);
      throw error;
    }
  },

  /**
   * Delete driver
   * @param {String} id - Driver ID
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  deleteDriver: async (id, token) => {
    try {
      const response = await apiService.delete(`${ENDPOINTS.DRIVERS.BASE}/${id}`, token);
      notificationService.showSuccess('Driver deleted successfully');
      return response;
    } catch (error) {
      notificationService.showError('Failed to delete driver', error);
      throw error;
    }
  },

  /**
   * Get driver statistics
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getDriverStats: async (token) => {
    try {
      const response = await apiService.get(ENDPOINTS.DRIVERS.STATS, {}, token);
      return response;
    } catch (error) {
      notificationService.showError('Failed to fetch driver statistics', error);
      throw error;
    }
  }
};

export default driverService;
