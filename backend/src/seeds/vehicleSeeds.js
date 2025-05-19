/**
 * Vehicle Seed Data
 * Creates initial vehicle data for the application
 */

const { Vehicle } = require('../models/vehicle.model');
const { Driver } = require('../models/driver.model');
const logger = require('../utils/logger');
const { Types } = require('mongoose');

/**
 * Seed vehicles collection with initial data
 * @returns {Promise<void>}
 */
const seedVehicles = async () => {
  try {
    // Check if vehicles already exist
    const count = await Vehicle.countDocuments();
    
    if (count > 0) {
      logger.info(`Skipping vehicle seeding. ${count} vehicles already exist.`);
      return;
    }
    
    // Get some driver IDs to assign to vehicles
    const drivers = await Driver.find().limit(5);
    const driverIds = drivers.map(driver => driver._id);
    
    // If no drivers exist, create placeholder IDs
    if (driverIds.length === 0) {
      for (let i = 0; i < 5; i++) {
        driverIds.push(new Types.ObjectId());
      }
    }
    
    // Sample vehicle data
    const vehicles = [
      {
        licensePlate: 'ABC-1234',
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        type: 'sedan',
        vin: '1HGCM82633A123456',
        status: 'active',
        fuelType: 'gasoline',
        tankCapacity: 15.8,
        currentFuelLevel: 12.3,
        currentOdometer: 12500,
        registrationDate: new Date('2022-01-15'),
        lastMaintenanceDate: new Date('2022-10-10'),
        nextMaintenanceDate: new Date('2023-04-10'),
        currentDriver: driverIds[0],
        insuranceInfo: {
          provider: 'AllState',
          policyNumber: 'AS-987654321',
          expiryDate: new Date('2023-12-31')
        }
      },
      {
        licensePlate: 'XYZ-5678',
        make: 'Honda',
        model: 'Civic',
        year: 2021,
        type: 'sedan',
        vin: '2HGFG12567H789012',
        status: 'active',
        fuelType: 'gasoline',
        tankCapacity: 12.4,
        currentFuelLevel: 6.2,
        currentOdometer: 18750,
        registrationDate: new Date('2021-05-20'),
        lastMaintenanceDate: new Date('2022-11-15'),
        nextMaintenanceDate: new Date('2023-05-15'),
        currentDriver: driverIds[1],
        insuranceInfo: {
          provider: 'Progressive',
          policyNumber: 'PG-123456789',
          expiryDate: new Date('2023-11-20')
        }
      },
      {
        licensePlate: 'DEF-9012',
        make: 'Ford',
        model: 'F-150',
        year: 2020,
        type: 'truck',
        vin: '1FTEW1EP7LFA12345',
        status: 'maintenance',
        fuelType: 'diesel',
        tankCapacity: 26.0,
        currentFuelLevel: 13.0,
        currentOdometer: 32000,
        registrationDate: new Date('2020-03-10'),
        lastMaintenanceDate: new Date('2022-12-05'),
        nextMaintenanceDate: new Date('2023-06-05'),
        currentDriver: null,
        insuranceInfo: {
          provider: 'GEICO',
          policyNumber: 'GE-567891234',
          expiryDate: new Date('2023-10-15')
        }
      },
      {
        licensePlate: 'GHI-3456',
        make: 'Chevrolet',
        model: 'Tahoe',
        year: 2021,
        type: 'suv',
        vin: '1GNSKBKC1LR123456',
        status: 'active',
        fuelType: 'gasoline',
        tankCapacity: 24.0,
        currentFuelLevel: 18.5,
        currentOdometer: 15000,
        registrationDate: new Date('2021-07-22'),
        lastMaintenanceDate: new Date('2022-09-18'),
        nextMaintenanceDate: new Date('2023-03-18'),
        currentDriver: driverIds[2],
        insuranceInfo: {
          provider: 'State Farm',
          policyNumber: 'SF-345678912',
          expiryDate: new Date('2023-08-22')
        }
      },
      {
        licensePlate: 'JKL-7890',
        make: 'Nissan',
        model: 'Rogue',
        year: 2022,
        type: 'suv',
        vin: '5N1AT2MT5LC123456',
        status: 'active',
        fuelType: 'gasoline',
        tankCapacity: 14.5,
        currentFuelLevel: 10.2,
        currentOdometer: 8500,
        registrationDate: new Date('2022-02-28'),
        lastMaintenanceDate: new Date('2022-08-15'),
        nextMaintenanceDate: new Date('2023-02-15'),
        currentDriver: driverIds[3],
        insuranceInfo: {
          provider: 'Liberty Mutual',
          policyNumber: 'LM-891234567',
          expiryDate: new Date('2023-09-30')
        }
      },
      {
        licensePlate: 'MNO-1234',
        make: 'Tesla',
        model: 'Model 3',
        year: 2022,
        type: 'sedan',
        vin: '5YJ3E1EA1NF123456',
        status: 'active',
        fuelType: 'electric',
        batteryCapacity: 82.0,
        currentBatteryLevel: 65.0,
        currentOdometer: 5200,
        registrationDate: new Date('2022-04-15'),
        lastMaintenanceDate: new Date('2022-10-20'),
        nextMaintenanceDate: new Date('2023-04-20'),
        currentDriver: driverIds[4],
        insuranceInfo: {
          provider: 'Farmers',
          policyNumber: 'FA-456789123',
          expiryDate: new Date('2023-11-15')
        }
      },
      {
        licensePlate: 'PQR-5678',
        make: 'Hyundai',
        model: 'Tucson',
        year: 2021,
        type: 'suv',
        vin: 'KM8J3CAL6MU123456',
        status: 'inactive',
        fuelType: 'gasoline',
        tankCapacity: 13.7,
        currentFuelLevel: 3.5,
        currentOdometer: 22000,
        registrationDate: new Date('2021-06-10'),
        lastMaintenanceDate: new Date('2022-07-25'),
        nextMaintenanceDate: new Date('2023-01-25'),
        currentDriver: null,
        insuranceInfo: {
          provider: 'Nationwide',
          policyNumber: 'NW-234567891',
          expiryDate: new Date('2023-07-10')
        }
      },
      {
        licensePlate: 'STU-9012',
        make: 'Jeep',
        model: 'Grand Cherokee',
        year: 2020,
        type: 'suv',
        vin: '1C4RJFAG5LC123456',
        status: 'maintenance',
        fuelType: 'gasoline',
        tankCapacity: 24.6,
        currentFuelLevel: 12.3,
        currentOdometer: 35000,
        registrationDate: new Date('2020-05-05'),
        lastMaintenanceDate: new Date('2022-11-30'),
        nextMaintenanceDate: new Date('2023-05-30'),
        currentDriver: null,
        insuranceInfo: {
          provider: 'Travelers',
          policyNumber: 'TR-678912345',
          expiryDate: new Date('2023-06-05')
        }
      }
    ];
    
    // Insert vehicles
    await Vehicle.insertMany(vehicles);
    
    logger.info(`Seeded ${vehicles.length} vehicles successfully`);
  } catch (error) {
    logger.error('Error seeding vehicles:', error);
    throw error;
  }
};

module.exports = seedVehicles;
