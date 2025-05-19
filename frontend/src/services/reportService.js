/**
 * Report Service
 * Handles API requests related to reports and analytics
 */

import { apiService } from '../utils/apiUtils';
import { ENDPOINTS } from '../config/api';

/**
 * Report service with methods for retrieving various reports
 */
const reportService = {
  /**
   * Get daily summary report
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getDailySummary: async (token) => {
    return apiService.get(ENDPOINTS.REPORTS.DAILY_SUMMARY, {}, token);
  },

  /**
   * Get maintenance due report
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getMaintenanceDue: async (token) => {
    return apiService.get(ENDPOINTS.REPORTS.MAINTENANCE_DUE, {}, token);
  },

  /**
   * Get fleet performance report
   * @param {Object} params - Query parameters (startDate, endDate)
   * @param {String} token - JWT token
   * @returns {Promise} API response
   */
  getFleetPerformance: async (params = {}, token) => {
    return apiService.get(ENDPOINTS.REPORTS.FLEET_PERFORMANCE, params, token);
  }
};

export default reportService;
