/**
 * Trip Seed Data
 * Creates initial trip data for the application
 */

const { Trip } = require('../models/trip.model');
const { Vehicle } = require('../models/vehicle.model');
const { Driver } = require('../models/driver.model');
const logger = require('../utils/logger');
const { Types } = require('mongoose');

/**
 * Seed trips collection with initial data
 * @returns {Promise<void>}
 */
const seedTrips = async () => {
  try {
    // Check if trips already exist
    const count = await Trip.countDocuments();
    
    if (count > 0) {
      logger.info(`Skipping trip seeding. ${count} trips already exist.`);
      return;
    }
    
    // Get vehicle and driver IDs to assign to trips
    const vehicles = await Vehicle.find().limit(5);
    const drivers = await Driver.find().limit(5);
    
    const vehicleIds = vehicles.map(vehicle => vehicle._id);
    const driverIds = drivers.map(driver => driver._id);
    
    // If no vehicles or drivers exist, create placeholder IDs
    if (vehicleIds.length === 0) {
      for (let i = 0; i < 5; i++) {
        vehicleIds.push(new Types.ObjectId());
      }
    }
    
    if (driverIds.length === 0) {
      for (let i = 0; i < 5; i++) {
        driverIds.push(new Types.ObjectId());
      }
    }
    
    // Sample trip data
    const trips = [
      {
        vehicle: vehicleIds[0],
        driver: driverIds[0],
        startLocation: {
          address: 'Company HQ, 123 Business Park, San Francisco, CA',
          coordinates: [37.7749, -122.4194]
        },
        endLocation: {
          address: 'Client Office, 456 Market St, San Francisco, CA',
          coordinates: [37.7922, -122.3987]
        },
        startTime: new Date('2023-01-15T08:30:00Z'),
        endTime: new Date('2023-01-15T09:15:00Z'),
        distance: 12.5,
        status: 'completed',
        purpose: 'Client Meeting',
        notes: 'Delivered quarterly reports',
        startOdometer: 12500,
        endOdometer: 12513,
        fuelConsumed: 1.2
      },
      {
        vehicle: vehicleIds[1],
        driver: driverIds[1],
        startLocation: {
          address: 'Company HQ, 123 Business Park, San Francisco, CA',
          coordinates: [37.7749, -122.4194]
        },
        endLocation: {
          address: 'Airport, 780 Airport Blvd, San Francisco, CA',
          coordinates: [37.6213, -122.3790]
        },
        startTime: new Date('2023-01-16T14:00:00Z'),
        endTime: new Date('2023-01-16T15:30:00Z'),
        distance: 25.8,
        status: 'completed',
        purpose: 'Executive Transport',
        notes: 'Picked up CEO from airport',
        startOdometer: 18750,
        endOdometer: 18776,
        fuelConsumed: 2.3
      },
      {
        vehicle: vehicleIds[2],
        driver: driverIds[2],
        startLocation: {
          address: 'Warehouse, 789 Industrial Ave, Oakland, CA',
          coordinates: [37.8044, -122.2712]
        },
        endLocation: {
          address: 'Distribution Center, 321 Logistics Way, San Jose, CA',
          coordinates: [37.3382, -121.8863]
        },
        startTime: new Date('2023-01-17T06:00:00Z'),
        endTime: new Date('2023-01-17T09:30:00Z'),
        distance: 65.3,
        status: 'completed',
        purpose: 'Freight Delivery',
        notes: 'Delivered monthly inventory shipment',
        startOdometer: 32000,
        endOdometer: 32065,
        fuelConsumed: 7.5
      },
      {
        vehicle: vehicleIds[3],
        driver: driverIds[0],
        startLocation: {
          address: 'Company HQ, 123 Business Park, San Francisco, CA',
          coordinates: [37.7749, -122.4194]
        },
        endLocation: {
          address: 'Conference Center, 555 Convention Plaza, San Francisco, CA',
          coordinates: [37.7833, -122.4167]
        },
        startTime: new Date('2023-01-18T09:00:00Z'),
        endTime: new Date('2023-01-18T09:30:00Z'),
        distance: 5.2,
        status: 'completed',
        purpose: 'Team Transport',
        notes: 'Transported marketing team to conference',
        startOdometer: 15000,
        endOdometer: 15005,
        fuelConsumed: 0.6
      },
      {
        vehicle: vehicleIds[4],
        driver: driverIds[3],
        startLocation: {
          address: 'Company HQ, 123 Business Park, San Francisco, CA',
          coordinates: [37.7749, -122.4194]
        },
        endLocation: {
          address: 'Client Site, 987 Tech Campus, Palo Alto, CA',
          coordinates: [37.4419, -122.1430]
        },
        startTime: new Date('2023-01-19T13:00:00Z'),
        endTime: null,
        distance: null,
        status: 'in_progress',
        purpose: 'Site Visit',
        notes: 'Technical team visiting client for system installation',
        startOdometer: 8500,
        endOdometer: null,
        fuelConsumed: null
      },
      {
        vehicle: vehicleIds[0],
        driver: driverIds[1],
        startLocation: {
          address: 'Company HQ, 123 Business Park, San Francisco, CA',
          coordinates: [37.7749, -122.4194]
        },
        endLocation: {
          address: 'Restaurant, 456 Dining Blvd, San Francisco, CA',
          coordinates: [37.7833, -122.4324]
        },
        startTime: new Date('2023-01-20T18:30:00Z'),
        endTime: null,
        distance: null,
        status: 'scheduled',
        purpose: 'Client Dinner',
        notes: 'Executive dinner with potential investors',
        startOdometer: null,
        endOdometer: null,
        fuelConsumed: null
      }
    ];
    
    // Insert trips
    await Trip.insertMany(trips);
    
    logger.info(`Seeded ${trips.length} trips successfully`);
  } catch (error) {
    logger.error('Error seeding trips:', error);
    throw error;
  }
};

module.exports = seedTrips;
