/**
 * Fuel Record Model
 * Defines the schema for tracking vehicle fuel consumption
 */

const mongoose = require('mongoose');

// Import Fuel Type constants
const { FUEL_TYPES } = require('../constants/fuelTypes');

/**
 * Fuel Record Schema
 * Comprehensive schema for tracking vehicle fuel consumption
 */
const fuelRecordSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver is required']
  },
  date: {
    type: Date,
    required: [true, 'Fuel fill date is required'],
    default: Date.now
  },
  fuelType: {
    type: String,
    enum: Object.values(FUEL_TYPES),
    default: FUEL_TYPES.GASOLINE,
    required: [true, 'Fuel type is required']
  },
  gallons: {
    type: Number,
    required: [true, 'Gallons/quantity is required'],
    min: [0.1, 'Gallons must be greater than 0']
  },
  pricePerGallon: {
    type: Number,
    required: [true, 'Price per gallon is required'],
    min: [0.01, 'Price per gallon must be greater than 0']
  },
  totalCost: {
    type: Number,
    required: [true, 'Total cost is required'],
    min: [0.01, 'Total cost must be greater than 0']
  },
  odometer: {
    type: Number,
    required: [true, 'Odometer reading is required'],
    min: [0, 'Odometer reading must be greater than or equal to 0']
  },
  fullTank: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating MPG (miles per gallon)
fuelRecordSchema.virtual('mpg').get(function() {
  if (!this._previousFill || !this.gallons) return null;
  
  const milesDriven = this.odometer - this._previousFill.odometer;
  if (milesDriven <= 0) return null;
  
  return (milesDriven / this.gallons).toFixed(2);
});

// Create indexes for faster queries
fuelRecordSchema.index({ vehicle: 1 });
fuelRecordSchema.index({ driver: 1 });
fuelRecordSchema.index({ date: 1 });

// Create and export Fuel Record model
const FuelRecord = mongoose.model('FuelRecord', fuelRecordSchema);

module.exports = FuelRecord;
