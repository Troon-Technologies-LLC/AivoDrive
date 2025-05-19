/**
 * Fuel Seeder
 * Populates the database with initial fuel records for testing and development
 */

const Fuel = require('../models/fuel.model');
const { Vehicle } = require('../models/vehicle.model');
const mongoose = require('mongoose');

/**
 * Generate random fuel records for vehicles
 * @param {Array} vehicles - Array of vehicle documents
 * @param {Object} admin - Admin user document for createdBy field
 * @returns {Promise<Array>} Array of created fuel records
 */
const seedFuel = async (vehicles, admin) => {
  try {
    // Clear existing fuel records
    await Fuel.deleteMany({});
    console.log('  - Cleared existing fuel records');
    
    const fuelRecords = [];
    
    // Create multiple fuel records for each vehicle
    for (const vehicle of vehicles) {
      // Generate between 5-10 fuel records per vehicle
      const recordCount = Math.floor(Math.random() * 6) + 5;
      
      // Set initial odometer reading
      let currentOdometer = Math.floor(Math.random() * 10000) + 5000;
      
      // Generate records going back 6 months
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 6);
      
      for (let i = 0; i < recordCount; i++) {
        // Calculate random date between start and end dates
        const recordDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        
        // Generate random fuel amount between 20-60 liters
        const fuelAmount = parseFloat((Math.random() * 40 + 20).toFixed(2));
        
        // Generate random fuel price between $1.20-$1.80 per liter
        const fuelPrice = parseFloat((Math.random() * 0.60 + 1.20).toFixed(2));
        
        // Calculate total cost
        const totalCost = parseFloat((fuelAmount * fuelPrice).toFixed(2));
        
        // Increment odometer by random amount (300-700 km)
        const previousOdometer = currentOdometer;
        currentOdometer += Math.floor(Math.random() * 400) + 300;
        
        // Generate random fuel station names
        const fuelStations = [
          'Shell',
          'BP',
          'Exxon',
          'Chevron',
          'Texaco',
          'Mobil',
          'Petro-Canada',
          'Circle K'
        ];
        const fuelStation = fuelStations[Math.floor(Math.random() * fuelStations.length)];
        
        // Create fuel record
        const fuelRecord = new Fuel({
          vehicle: vehicle._id,
          driver: vehicle.currentDriver || null,
          date: recordDate,
          fuelAmount,
          fuelPrice,
          totalCost,
          odometer: currentOdometer,
          previousOdometer,
          fuelStation,
          notes: `Regular refueling for ${vehicle.make} ${vehicle.model}`,
          createdBy: admin._id
        });
        
        fuelRecords.push(fuelRecord);
      }
      
      // Update vehicle's current odometer reading
      await Vehicle.findByIdAndUpdate(vehicle._id, { mileage: currentOdometer });
    }
    
    // Save all fuel records to database
    await Fuel.insertMany(fuelRecords);
    console.log(`  - Created ${fuelRecords.length} fuel records for ${vehicles.length} vehicles`);
    
    return fuelRecords;
  } catch (error) {
    console.error('Error seeding fuel records:', error);
    throw error;
  }
};

module.exports = {
  seedFuel
};
