/**
 * Vehicle Service
 * Handles API requests related to vehicle management with integrated notifications
 */

import { apiService } from '../utils/apiUtils';
import { ENDPOINTS } from '../config/api';
import notificationService from './notificationService';

/**
 * Vehicle service with methods for CRUD operations
 * Each method includes success and error notifications
 */
const vehicleService = {
  /**
   * Get all vehicles with optional filtering
   * @param {Object} params - Query parameters (page, limit, search, status)
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getVehicles: async (params = {}, token) => {
    try {
      const response = await apiService.get(ENDPOINTS.VEHICLES.BASE, params, token);
      return response;
    } catch (error) {
      notificationService.showError('Failed to fetch vehicles', error);
      throw error;
    }
  },

  /**
   * Get vehicle by ID
   * @param {String} id - Vehicle ID
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getVehicleById: async (id, token) => {
    try {
      const response = await apiService.get(`${ENDPOINTS.VEHICLES.BASE}/${id}`, {}, token);
      return response;
    } catch (error) {
      notificationService.showError('Failed to fetch vehicle details', error);
      throw error;
    }
  },

  /**
   * Create new vehicle
   * @param {Object} vehicleData - Vehicle data
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  createVehicle: async (vehicleData, token) => {
    try {
      const response = await apiService.post(ENDPOINTS.VEHICLES.BASE, vehicleData, token);
      notificationService.showSuccess('Vehicle created successfully');
      return response;
    } catch (error) {
      notificationService.showError('Failed to create vehicle', error);
      throw error;
    }
  },

  /**
   * Update vehicle
   * @param {String} id - Vehicle ID
   * @param {Object} vehicleData - Updated vehicle data
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  updateVehicle: async (id, vehicleData, token) => {
    try {
      const response = await apiService.put(`${ENDPOINTS.VEHICLES.BASE}/${id}`, vehicleData, token);
      notificationService.showSuccess('Vehicle updated successfully');
      return response;
    } catch (error) {
      notificationService.showError('Failed to update vehicle', error);
      throw error;
    }
  },

  /**
   * Delete vehicle
   * @param {String} id - Vehicle ID
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  deleteVehicle: async (id, token) => {
    try {
      const response = await apiService.delete(`${ENDPOINTS.VEHICLES.BASE}/${id}`, token);
      notificationService.showSuccess('Vehicle deleted successfully');
      return response;
    } catch (error) {
      notificationService.showError('Failed to delete vehicle', error);
      throw error;
    }
  },

  /**
   * Get vehicle statistics
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getVehicleStats: async (token) => {
    try {
      const response = await apiService.get(ENDPOINTS.VEHICLES.STATS, {}, token);
      return response;
    } catch (error) {
      notificationService.showError('Failed to fetch vehicle statistics', error);
      throw error;
    }
  }
};

export default vehicleService;
