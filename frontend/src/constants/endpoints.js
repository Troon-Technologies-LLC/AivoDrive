/**
 * API Endpoints
 * Constants for all API endpoints used in the application
 */

/**
 * API endpoints organized by resource type
 */
export const ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile'
  },
  
  // User endpoints
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password'
  },
  
  // Vehicle endpoints
  VEHICLES: {
    BASE: '/vehicles',
    STATS: '/vehicles/stats',
    ASSIGN_DRIVER: '/vehicles/assign-driver',
    MAINTENANCE_HISTORY: '/vehicles/maintenance-history',
    FUEL_HISTORY: '/vehicles/fuel-history',
    TRIP_HISTORY: '/vehicles/trip-history'
  },
  
  // Driver endpoints
  DRIVERS: {
    BASE: '/drivers',
    STATS: '/drivers/stats',
    ASSIGN_VEHICLE: '/drivers/assign-vehicle',
    TRIP_HISTORY: '/drivers/trip-history',
    AVAILABLE: '/drivers/available'
  },
  
  // Trip endpoints
  TRIPS: {
    BASE: '/trips',
    STATS: '/trips/stats',
    ASSIGN: '/trips/assign',
    START: '/trips/start',
    COMPLETE: '/trips/complete',
    CANCEL: '/trips/cancel',
    CURRENT: '/trips/current'
  },
  
  // Maintenance endpoints
  MAINTENANCE: {
    BASE: '/maintenance',
    STATS: '/maintenance/stats',
    SCHEDULE: '/maintenance/schedule',
    COMPLETE: '/maintenance/complete',
    UPCOMING: '/maintenance/upcoming',
    OVERDUE: '/maintenance/overdue'
  },
  
  // Fuel endpoints
  FUEL: {
    BASE: '/fuel',
    STATS: '/fuel/stats',
    EFFICIENCY_REPORT: '/fuel/efficiency-report'
  },
  
  // Report endpoints
  REPORTS: {
    BASE: '/reports',
    VEHICLE_USAGE: '/reports/vehicle-usage',
    DRIVER_PERFORMANCE: '/reports/driver-performance',
    FUEL_CONSUMPTION: '/reports/fuel-consumption',
    MAINTENANCE_COST: '/reports/maintenance-cost',
    TRIP_SUMMARY: '/reports/trip-summary',
    EXPORT: '/reports/export'
  },
  
  // Notification endpoints
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD: '/notifications/unread',
    MARK_READ: '/notifications/mark-read',
    SETTINGS: '/notifications/settings'
  },
  
  // Dashboard endpoints
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ACTIVITIES: '/dashboard/recent-activities',
    ALERTS: '/dashboard/alerts'
  },
  
  // Settings endpoints
  SETTINGS: {
    BASE: '/settings',
    SYSTEM: '/settings/system',
    NOTIFICATIONS: '/settings/notifications',
    APPEARANCE: '/settings/appearance'
  },
  
  // File upload endpoints
  UPLOADS: {
    BASE: '/uploads',
    VEHICLE_IMAGES: '/uploads/vehicle-images',
    DRIVER_IMAGES: '/uploads/driver-images',
    DOCUMENTS: '/uploads/documents'
  }
};
