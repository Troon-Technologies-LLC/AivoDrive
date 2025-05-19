/**
 * Trip Model
 * Defines the schema for trip management in the fleet system
 */

const mongoose = require('mongoose');

// Import Trip status constants
const { TRIP_STATUS } = require('../constants/tripStatus');

// Trip Schema
const tripSchema = new mongoose.Schema({
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
  startLocation: {
    address: {
      type: String,
      required: [true, 'Start location address is required']
    },
    coordinates: {
      type: [Number], // [latitude, longitude]
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -90 && v[0] <= 90 && 
                 v[1] >= -180 && v[1] <= 180;
        },
        message: 'Invalid coordinates format. Use [latitude, longitude] within valid ranges.'
      }
    }
  },
  endLocation: {
    address: {
      type: String,
      required: [true, 'End location address is required']
    },
    coordinates: {
      type: [Number], // [latitude, longitude]
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -90 && v[0] <= 90 && 
                 v[1] >= -180 && v[1] <= 180;
        },
        message: 'Invalid coordinates format. Use [latitude, longitude] within valid ranges.'
      }
    }
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date
  },
  estimatedDistance: {
    type: Number,
    default: 0
  },
  actualDistance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: Object.values(TRIP_STATUS),
    default: TRIP_STATUS.SCHEDULED
  },
  purpose: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  startOdometer: {
    type: Number,
    min: 0
  },
  endOdometer: {
    type: Number,
    min: 0
  },
  fuelConsumed: {
    type: Number,
    min: 0
  },
  route: {
    type: String, // Encoded polyline string
    default: ''
  },
  notes: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
tripSchema.index({ vehicleId: 1 });
tripSchema.index({ driverId: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ startTime: 1 });

// Create and export Trip model
const Trip = mongoose.model('Trip', tripSchema);

module.exports = {
  Trip,
  TRIP_STATUS
};
