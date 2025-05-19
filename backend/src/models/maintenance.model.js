/**
 * Maintenance Model
 * Defines the schema for vehicle maintenance scheduling and tracking
 */

const mongoose = require('mongoose');

// Import Maintenance status constants
const { MAINTENANCE_STATUS } = require('../constants/maintenanceStatus');

// Maintenance Schema
const maintenanceSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  type: {
    type: String,
    enum: ['oil_change', 'tire_rotation', 'brake_service', 'inspection', 'scheduled_maintenance', 'repair', 'tire_replacement', 'other'],
    required: [true, 'Maintenance type is required']
  },
  date: {
    type: Date,
    default: null
  },
  odometer: {
    type: Number,
    min: 0,
    default: null
  },
  description: {
    type: String,
    required: [true, 'Maintenance description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(MAINTENANCE_STATUS),
    default: MAINTENANCE_STATUS.SCHEDULED
  },

  cost: {
    type: Number,
    default: null
  },
  vendor: {
    type: String,
    trim: true
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  nextDueDate: {
    type: Date,
    default: null
  },
  nextDueOdometer: {
    type: Number,
    min: 0,
    default: null
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
maintenanceSchema.index({ vehicle: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ date: 1 });

// Create and export Maintenance model
const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

module.exports = Maintenance;
