/**
 * Vehicle Model
 * Defines the schema for vehicle management in the fleet system
 */

const mongoose = require('mongoose');

// Import Vehicle status constants
const { VEHICLE_STATUS } = require('../constants/vehicleStatus');

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1900, 'Year must be at least 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: Object.values(VEHICLE_STATUS),
    default: VEHICLE_STATUS.ACTIVE
  },
  lastServiceDate: {
    type: Date,
    default: null
  },
  currentDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'other'],
    default: 'gasoline'
  },
  fuelCapacity: {
    type: Number,
    default: 0
  },
  mileage: {
    type: Number,
    default: 0
  },
  vinNumber: {
    type: String,
    trim: true
  },
  registrationExpiry: {
    type: Date
  },
  insuranceExpiry: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ currentDriver: 1 });

// Create and export Vehicle model
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = {
  Vehicle,
  VEHICLE_STATUS
};
