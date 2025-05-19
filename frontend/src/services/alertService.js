/**
 * Alert Service
 * Handles API requests related to system alerts and notifications
 */

import { apiService } from '../utils/apiUtils';
import { ENDPOINTS } from '../config/api';

/**
 * Alert service with methods for CRUD operations
 */
const alertService = {
  /**
   * Get all alerts with optional filtering
   * @param {Object} params - Query parameters (page, limit, type, priority, isRead)
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getAlerts: async (params = {}, token) => {
    return apiService.get(ENDPOINTS.ALERTS.BASE, params, token);
  },

  /**
   * Get alert by ID
   * @param {String} id - Alert ID
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getAlertById: async (id, token) => {
    return apiService.get(`${ENDPOINTS.ALERTS.BASE}/${id}`, {}, token);
  },

  /**
   * Create new alert
   * @param {Object} alertData - Alert data
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  createAlert: async (alertData, token) => {
    return apiService.post(ENDPOINTS.ALERTS.BASE, alertData, token);
  },

  /**
   * Update alert
   * @param {String} id - Alert ID
   * @param {Object} alertData - Updated alert data
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  updateAlert: async (id, alertData, token) => {
    return apiService.put(`${ENDPOINTS.ALERTS.BASE}/${id}`, alertData, token);
  },

  /**
   * Mark alert as read
   * @param {String} id - Alert ID
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  markAlertAsRead: async (id, token) => {
    return apiService.put(`${ENDPOINTS.ALERTS.BASE}/${id}/read`, {}, token);
  },

  /**
   * Delete alert
   * @param {String} id - Alert ID
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  deleteAlert: async (id, token) => {
    return apiService.delete(`${ENDPOINTS.ALERTS.BASE}/${id}`, token);
  },

  /**
   * Get unread alerts count
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getUnreadAlertsCount: async (token) => {
    return apiService.get(ENDPOINTS.ALERTS.UNREAD_COUNT, {}, token);
  }
};

export default alertService;
