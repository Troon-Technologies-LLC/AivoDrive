/**
 * Fuel Model
 * Mongoose schema for fuel records
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Fuel schema definition
 */
const fuelSchema = new Schema({
  // Reference to the vehicle that received fuel
  vehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  
  // Reference to the driver who fueled the vehicle (optional)
  driver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Date and time when the fueling occurred
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Amount of fuel added in liters
  fuelAmount: {
    type: Number,
    required: true
  },
  
  // Price per liter of fuel
  fuelPrice: {
    type: Number,
    required: true
  },
  
  // Total cost of the fuel purchase
  totalCost: {
    type: Number,
    required: true
  },
  
  // Current odometer reading at the time of fueling
  odometer: {
    type: Number,
    default: null
  },
  
  // Previous odometer reading (for calculating fuel efficiency)
  previousOdometer: {
    type: Number,
    default: null
  },
  
  // Name or location of the fuel station
  fuelStation: {
    type: String,
    default: ''
  },
  
  // Additional notes about the fuel purchase
  notes: {
    type: String,
    default: ''
  },
  
  // Reference to the user who created the record
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true }, // Include virtuals when document is converted to JSON
  toObject: { virtuals: true } // Include virtuals when document is converted to object
});

/**
 * Virtual for fuel efficiency (km/L)
 */
fuelSchema.virtual('fuelEfficiency').get(function() {
  if (this.odometer && this.previousOdometer && this.fuelAmount) {
    const distance = this.odometer - this.previousOdometer;
    return distance / this.fuelAmount;
  }
  return null;
});

/**
 * Virtual for cost per kilometer
 */
fuelSchema.virtual('costPerKm').get(function() {
  if (this.odometer && this.previousOdometer && this.totalCost) {
    const distance = this.odometer - this.previousOdometer;
    return this.totalCost / distance;
  }
  return null;
});

/**
 * Pre-save middleware to calculate total cost if not provided
 */
fuelSchema.pre('save', function(next) {
  if (this.fuelAmount && this.fuelPrice && !this.totalCost) {
    this.totalCost = this.fuelAmount * this.fuelPrice;
  }
  next();
});

module.exports = mongoose.model('Fuel', fuelSchema);
