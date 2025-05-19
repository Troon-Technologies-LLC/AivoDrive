/**
 * API Configuration
 * Contains base URL and other API-related constants
 */

// Base URL for API requests
export const API_BASE_URL = 'http://localhost:5005/api';

// Default request timeout in milliseconds
export const API_TIMEOUT = 30000;

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile'
  },
  
  // Vehicle endpoints
  VEHICLES: {
    BASE: '/vehicles',
    STATS: '/vehicles/stats'
  },
  
  // Driver endpoints
  DRIVERS: {
    BASE: '/drivers',
    STATS: '/drivers/stats'
  },
  
  // Trip endpoints
  TRIPS: {
    BASE: '/trips',
    STATS: '/trips/stats'
  },
  
  // Maintenance endpoints
  MAINTENANCE: {
    BASE: '/maintenance',
    STATS: '/maintenance/stats'
  },
  
  // Report endpoints
  REPORTS: {
    DAILY_SUMMARY: '/reports/daily-summary',
    MAINTENANCE_DUE: '/reports/maintenance-due',
    FLEET_PERFORMANCE: '/reports/fleet-performance'
  },
  
  // Alert endpoints
  ALERTS: {
    BASE: '/alerts',
    UNREAD_COUNT: '/alerts/unread/count'
  }
};
