/**
 * Driver Seeder
 * Creates initial driver records linked to user accounts
 */

const { Driver, DRIVER_STATUS } = require('../models/driver.model');
const { Vehicle } = require('../models/vehicle.model');

/**
 * Seed drivers with various statuses and assign vehicles
 * @param {Array} driverUsers - User accounts with driver role
 * @param {Array} vehicles - Vehicle records to assign to drivers
 * @returns {Array} Created driver records
 */
const seedDrivers = async (driverUsers, vehicles) => {
  try {
    // Clear existing drivers
    await Driver.deleteMany({});
    
    // Reset vehicle assignments
    for (const vehicle of vehicles) {
      if (vehicle.status === 'active') {
        await Vehicle.findByIdAndUpdate(vehicle._id, { currentDriver: null });
      }
    }
    
    // Get active vehicles for assignment
    const activeVehicles = vehicles.filter(vehicle => vehicle.status === 'active');
    
    // Create drivers and assign vehicles
    const drivers = [];
    for (let i = 0; i < driverUsers.length; i++) {
      // Determine driver status and vehicle assignment
      let status = DRIVER_STATUS.AVAILABLE;
      let assignedVehicle = null;
      
      // Assign vehicles to first 3 drivers
      if (i < 3 && i < activeVehicles.length) {
        assignedVehicle = activeVehicles[i]._id;
        
        // Update vehicle with driver assignment
        await Vehicle.findByIdAndUpdate(assignedVehicle, {
          currentDriver: driverUsers[i]._id
        });
      }
      
      // Set one driver to ON_TRIP status
      if (i === 0) {
        status = DRIVER_STATUS.ON_TRIP;
      }
      // Set one driver to OFF_DUTY status
      else if (i === driverUsers.length - 1) {
        status = DRIVER_STATUS.OFF_DUTY;
      }
      
      // Create driver record
      const driver = await Driver.create({
        userId: driverUsers[i]._id,
        licenseNumber: `DL-${100000 + i}`,
        licenseExpiry: new Date(2026, i % 12, 15), // Random expiry date
        assignedVehicle,
        status,
        totalTrips: Math.floor(Math.random() * 50), // Random trip count
        totalDistance: Math.floor(Math.random() * 5000), // Random distance
        address: `${1000 + i} Main Street, City, State, 10000`,
        emergencyContact: {
          name: `Emergency Contact ${i + 1}`,
          phone: `+1987654321${i}`,
          relationship: i % 2 === 0 ? 'Spouse' : 'Parent'
        },
        notes: `Driver ${i + 1} notes`
      });
      
      drivers.push(driver);
    }
    
    return drivers;
  } catch (error) {
    console.error('Error seeding drivers:', error);
    throw error;
  }
};

module.exports = {
  seedDrivers
};
