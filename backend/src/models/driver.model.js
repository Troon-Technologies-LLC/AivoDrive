/**
 * Driver Model
 * Defines the schema for driver management in the fleet system
 * Extends the User model with driver-specific fields
 */

const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');

// Import Driver status constants
const { DRIVER_STATUS } = require('../constants/driverStatus');

/**
 * Driver Schema
 * Comprehensive schema for driver information management
 */
const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  licenseNumber: {
    type: String,
    required: [true, 'Driver license number is required'],
    unique: true,
    trim: true
  },
  licenseExpiry: {
    type: Date,
    required: [true, 'License expiry date is required']
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  status: {
    type: String,
    enum: Object.values(DRIVER_STATUS),
    default: DRIVER_STATUS.AVAILABLE
  },
  address: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  drivingExperience: {
    type: Number,
    min: 0
  },
  performanceRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalTrips: {
    type: Number,
    default: 0
  },
  totalDistance: {
    type: Number,
    default: 0
  },
  address: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
driverSchema.index({ userId: 1 });
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ assignedVehicle: 1 });

// Create and export Driver model
const Driver = mongoose.model('Driver', driverSchema);

module.exports = {
  Driver,
  DRIVER_STATUS
};
