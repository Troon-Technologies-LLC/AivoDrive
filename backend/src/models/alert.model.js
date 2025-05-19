/**
 * Alert Model
 * Defines the schema for system alerts and notifications
 */

const mongoose = require('mongoose');

// Define Alert type constants
const ALERT_TYPE = {
  MAINTENANCE_DUE: 'maintenance_due',
  VEHICLE_ISSUE: 'vehicle_issue',
  DRIVER_LICENSE_EXPIRY: 'driver_license_expiry',
  VEHICLE_REGISTRATION_EXPIRY: 'vehicle_registration_expiry',
  VEHICLE_INSURANCE_EXPIRY: 'vehicle_insurance_expiry',
  TRIP_DELAY: 'trip_delay',
  SYSTEM: 'system'
};

// Define Alert priority constants
const ALERT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Alert Schema
const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(ALERT_TYPE),
    required: [true, 'Alert type is required']
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: Object.values(ALERT_PRIORITY),
    default: ALERT_PRIORITY.MEDIUM
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Vehicle', 'Driver', 'Trip', 'Maintenance', 'User'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
alertSchema.index({ type: 1 });
alertSchema.index({ priority: 1 });
alertSchema.index({ isRead: 1 });
alertSchema.index({ 'relatedTo.model': 1, 'relatedTo.id': 1 });

// Create and export Alert model
const Alert = mongoose.model('Alert', alertSchema);

module.exports = {
  Alert,
  ALERT_TYPE,
  ALERT_PRIORITY
};
