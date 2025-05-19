/**
 * Trip Seeder
 * Creates initial trip records for the fleet management system
 */

const { Trip, TRIP_STATUS } = require('../models/trip.model');

/**
 * Seed trips with various statuses, origins, and destinations
 * @param {Array} vehicles - Vehicle records to assign to trips
 * @param {Array} drivers - Driver records to assign to trips
 * @param {Object} admin - Admin user for createdBy field
 * @returns {Array} Created trip records
 */
const seedTrips = async (vehicles, drivers, admin) => {
  try {
    // Clear existing trips
    await Trip.deleteMany({});
    
    // Get active vehicles and available/on-trip drivers
    const activeVehicles = vehicles.filter(vehicle => vehicle.status === 'active');
    const availableDrivers = drivers.filter(driver => 
      driver.status === 'available' || driver.status === 'on_trip'
    );
    
    // Sample locations for trip origins and destinations
    const locations = [
      { name: 'Headquarters', coordinates: [-74.0060, 40.7128] }, // NYC
      { name: 'Warehouse A', coordinates: [-73.9857, 40.7484] }, // Manhattan
      { name: 'Distribution Center', coordinates: [-74.0776, 40.7282] }, // Jersey City
      { name: 'Client Office', coordinates: [-73.9172, 40.7680] }, // Queens
      { name: 'Retail Store', coordinates: [-73.9442, 40.6782] }, // Brooklyn
      { name: 'Airport', coordinates: [-73.7781, 40.6413] }, // JFK Airport
      { name: 'Manufacturing Plant', coordinates: [-74.1745, 40.7357] }, // Newark
      { name: 'Regional Office', coordinates: [-73.9654, 40.8116] }, // Bronx
      { name: 'Customer Site', coordinates: [-73.7004, 40.7654] }, // Long Island
      { name: 'Supplier Facility', coordinates: [-74.0431, 40.6892] } // Bayonne
    ];
    
    // Define trip data
    const tripData = [];
    
    // Create completed trips (past)
    for (let i = 0; i < 15; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30) - 1); // Random date in the past 30 days
      
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 5) + 1); // 1-6 hours after start
      
      const originIndex = Math.floor(Math.random() * locations.length);
      let destinationIndex;
      do {
        destinationIndex = Math.floor(Math.random() * locations.length);
      } while (destinationIndex === originIndex);
      
      const vehicleIndex = i % activeVehicles.length;
      const driverIndex = i % availableDrivers.length;
      
      const distance = Math.floor(Math.random() * 100) + 10; // 10-110 miles
      
      tripData.push({
        vehicleId: activeVehicles[vehicleIndex]._id,
        driverId: availableDrivers[driverIndex]._id,
        origin: locations[originIndex],
        destination: locations[destinationIndex],
        startTime: startDate,
        endTime: endDate,
        estimatedDistance: distance - 5,
        actualDistance: distance,
        status: TRIP_STATUS.COMPLETED,
        route: 'encoded_polyline_string_would_go_here',
        notes: `Completed trip ${i + 1}`,
        purpose: ['Delivery', 'Pickup', 'Client Meeting', 'Maintenance Run', 'Supply Transport'][i % 5],
        createdBy: admin._id
      });
    }
    
    // Create in-progress trips (current)
    for (let i = 0; i < 2; i++) {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - Math.floor(Math.random() * 3)); // Started 0-3 hours ago
      
      const originIndex = Math.floor(Math.random() * locations.length);
      let destinationIndex;
      do {
        destinationIndex = Math.floor(Math.random() * locations.length);
      } while (destinationIndex === originIndex);
      
      // Find driver with ON_TRIP status
      const onTripDriver = drivers.find(driver => driver.status === 'on_trip');
      const driverId = onTripDriver ? onTripDriver._id : availableDrivers[0]._id;
      
      // Use the vehicle assigned to this driver if possible
      const driverObj = drivers.find(d => d._id.toString() === driverId.toString());
      const vehicleId = driverObj && driverObj.assignedVehicle 
        ? driverObj.assignedVehicle 
        : activeVehicles[0]._id;
      
      const distance = Math.floor(Math.random() * 100) + 10; // 10-110 miles
      
      tripData.push({
        vehicleId,
        driverId,
        origin: locations[originIndex],
        destination: locations[destinationIndex],
        startTime: startDate,
        endTime: null,
        estimatedDistance: distance,
        actualDistance: 0, // Not completed yet
        status: TRIP_STATUS.IN_PROGRESS,
        route: 'encoded_polyline_string_would_go_here',
        notes: `In-progress trip ${i + 1}`,
        purpose: ['Delivery', 'Client Meeting'][i % 2],
        createdBy: admin._id
      });
    }
    
    // Create scheduled trips (future)
    for (let i = 0; i < 8; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 7) + 1); // Random date in next 7 days
      
      const originIndex = Math.floor(Math.random() * locations.length);
      let destinationIndex;
      do {
        destinationIndex = Math.floor(Math.random() * locations.length);
      } while (destinationIndex === originIndex);
      
      const vehicleIndex = i % activeVehicles.length;
      const driverIndex = i % availableDrivers.length;
      
      const distance = Math.floor(Math.random() * 100) + 10; // 10-110 miles
      
      tripData.push({
        vehicleId: activeVehicles[vehicleIndex]._id,
        driverId: availableDrivers[driverIndex]._id,
        origin: locations[originIndex],
        destination: locations[destinationIndex],
        startTime: startDate,
        endTime: null,
        estimatedDistance: distance,
        actualDistance: 0, // Not started yet
        status: TRIP_STATUS.SCHEDULED,
        route: 'encoded_polyline_string_would_go_here',
        notes: `Scheduled trip ${i + 1}`,
        purpose: ['Delivery', 'Pickup', 'Client Meeting', 'Maintenance Run', 'Supply Transport'][i % 5],
        createdBy: admin._id
      });
    }
    
    // Create trips
    const trips = [];
    for (const data of tripData) {
      const trip = await Trip.create(data);
      trips.push(trip);
    }
    
    return trips;
  } catch (error) {
    console.error('Error seeding trips:', error);
    throw error;
  }
};

module.exports = {
  seedTrips
};
