/**
 * Fuel Record Seed Data
 * Creates initial fuel records for the application
 */

const FuelRecord = require('../models/fuelRecord.model');
const { Vehicle } = require('../models/vehicle.model');
const { Driver } = require('../models/driver.model');
const logger = require('../utils/logger');
const { Types } = require('mongoose');

/**
 * Seed fuel records collection with initial data
 * @returns {Promise<void>}
 */
const seedFuelRecords = async () => {
  try {
    // Check if fuel records already exist
    const count = await FuelRecord.countDocuments();
    
    if (count > 0) {
      logger.info(`Skipping fuel record seeding. ${count} fuel records already exist.`);
      return;
    }
    
    // Get vehicle and driver IDs to assign to fuel records
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
    
    // Sample fuel record data
    const fuelRecords = [
      {
        vehicle: vehicleIds[0],
        driver: driverIds[0],
        date: new Date('2023-01-05'),
        fuelType: 'gasoline',
        gallons: 12.5,
        pricePerGallon: 3.85,
        totalCost: 48.13,
        odometer: 11500,
        fullTank: true,
        location: 'Shell Gas Station, 123 Main St, San Francisco, CA',
        notes: 'Regular fill-up'
      },
      {
        vehicle: vehicleIds[1],
        driver: driverIds[1],
        date: new Date('2023-01-08'),
        fuelType: 'gasoline',
        gallons: 10.2,
        pricePerGallon: 3.79,
        totalCost: 38.66,
        odometer: 18200,
        fullTank: true,
        location: 'Chevron, 456 Market St, San Francisco, CA',
        notes: 'Vehicle running efficiently'
      },
      {
        vehicle: vehicleIds[2],
        driver: driverIds[2],
        date: new Date('2023-01-10'),
        fuelType: 'diesel',
        gallons: 18.7,
        pricePerGallon: 4.25,
        totalCost: 79.48,
        odometer: 31000,
        fullTank: true,
        location: 'Truck Stop, 789 Highway Ave, Oakland, CA',
        notes: 'Filled before long delivery route'
      },
      {
        vehicle: vehicleIds[3],
        driver: driverIds[0],
        date: new Date('2023-01-12'),
        fuelType: 'gasoline',
        gallons: 15.3,
        pricePerGallon: 3.95,
        totalCost: 60.44,
        odometer: 14500,
        fullTank: true,
        location: 'Costco Gas, 321 Wholesale Blvd, San Francisco, CA',
        notes: 'Used company gas card'
      },
      {
        vehicle: vehicleIds[4],
        driver: driverIds[3],
        date: new Date('2023-01-14'),
        fuelType: 'gasoline',
        gallons: 8.5,
        pricePerGallon: 3.89,
        totalCost: 33.07,
        odometer: 4800,
        fullTank: false,
        location: '76 Station, 654 Broadway, San Francisco, CA',
        notes: 'Partial fill-up'
      },
      {
        vehicle: vehicleIds[0],
        driver: driverIds[1],
        date: new Date('2023-01-15'),
        fuelType: 'gasoline',
        gallons: 11.8,
        pricePerGallon: 3.92,
        totalCost: 46.26,
        odometer: 12300,
        fullTank: true,
        location: 'Arco, 987 Van Ness Ave, San Francisco, CA',
        notes: 'Regular fill-up after client meetings'
      },
      {
        vehicle: vehicleIds[1],
        driver: driverIds[2],
        date: new Date('2023-01-17'),
        fuelType: 'gasoline',
        gallons: 9.7,
        pricePerGallon: 3.85,
        totalCost: 37.35,
        odometer: 18650,
        fullTank: true,
        location: 'Shell Gas Station, 555 Mission St, San Francisco, CA',
        notes: 'Noticed slightly lower fuel efficiency'
      },
      {
        vehicle: vehicleIds[2],
        driver: driverIds[0],
        date: new Date('2023-01-18'),
        fuelType: 'diesel',
        gallons: 20.5,
        pricePerGallon: 4.15,
        totalCost: 85.08,
        odometer: 31800,
        fullTank: true,
        location: 'Flying J, 246 Interstate Hwy, Oakland, CA',
        notes: 'Preparing for long-haul delivery'
      }
    ];
    
    // Insert fuel records
    await FuelRecord.insertMany(fuelRecords);
    
    logger.info(`Seeded ${fuelRecords.length} fuel records successfully`);
  } catch (error) {
    logger.error('Error seeding fuel records:', error);
    throw error;
  }
};

module.exports = seedFuelRecords;
