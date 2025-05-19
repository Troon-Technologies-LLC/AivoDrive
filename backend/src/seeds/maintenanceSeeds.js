/**
 * Maintenance Seed Data
 * Creates initial maintenance records for the application
 */

const Maintenance = require('../models/maintenance.model');
const { Vehicle } = require('../models/vehicle.model');
const logger = require('../utils/logger');
const { Types } = require('mongoose');

/**
 * Seed maintenance collection with initial data
 * @returns {Promise<void>}
 */
const seedMaintenance = async () => {
  try {
    // Check if maintenance records already exist
    const count = await Maintenance.countDocuments();
    
    if (count > 0) {
      logger.info(`Skipping maintenance seeding. ${count} maintenance records already exist.`);
      return;
    }
    
    // Get vehicle IDs to assign to maintenance records
    const vehicles = await Vehicle.find().limit(5);
    const vehicleIds = vehicles.map(vehicle => vehicle._id);
    
    // If no vehicles exist, create placeholder IDs
    if (vehicleIds.length === 0) {
      for (let i = 0; i < 5; i++) {
        vehicleIds.push(new Types.ObjectId());
      }
    }
    
    // Sample maintenance data
    const maintenanceRecords = [
      {
        vehicle: vehicleIds[0],
        type: 'oil_change',
        description: 'Regular oil change and filter replacement',
        date: new Date('2022-10-10'),
        odometer: 12000,
        cost: 75.50,
        vendor: 'Quick Lube Service',
        invoiceNumber: 'QL-12345',
        notes: 'Used synthetic oil',
        status: 'completed',
        nextDueDate: new Date('2023-04-10'),
        nextDueOdometer: 15000
      },
      {
        vehicle: vehicleIds[1],
        type: 'tire_rotation',
        description: 'Tire rotation and pressure check',
        date: new Date('2022-11-15'),
        odometer: 18500,
        cost: 45.00,
        vendor: 'Tire World',
        invoiceNumber: 'TW-56789',
        notes: 'Recommended new tires within next 5000 miles',
        status: 'completed',
        nextDueDate: new Date('2023-05-15'),
        nextDueOdometer: 23500
      },
      {
        vehicle: vehicleIds[2],
        type: 'brake_service',
        description: 'Brake pad replacement - front and rear',
        date: new Date('2022-12-05'),
        odometer: 31500,
        cost: 350.75,
        vendor: 'Auto Repair Shop',
        invoiceNumber: 'ARS-98765',
        notes: 'Replaced both front and rear brake pads, rotors in good condition',
        status: 'completed',
        nextDueDate: new Date('2023-12-05'),
        nextDueOdometer: 51500
      },
      {
        vehicle: vehicleIds[3],
        type: 'inspection',
        description: 'Annual vehicle inspection',
        date: new Date('2022-09-18'),
        odometer: 14800,
        cost: 120.00,
        vendor: 'State Inspection Center',
        invoiceNumber: 'SIC-54321',
        notes: 'Passed all inspection points',
        status: 'completed',
        nextDueDate: new Date('2023-09-18'),
        nextDueOdometer: 29800
      },
      {
        vehicle: vehicleIds[4],
        type: 'oil_change',
        description: 'Oil change and multi-point inspection',
        date: new Date('2022-10-20'),
        odometer: 5000,
        cost: 85.25,
        vendor: 'Dealership Service Center',
        invoiceNumber: 'DSC-24680',
        notes: 'All fluids topped off, no issues found',
        status: 'completed',
        nextDueDate: new Date('2023-04-20'),
        nextDueOdometer: 10000
      },
      {
        vehicle: vehicleIds[0],
        type: 'scheduled_maintenance',
        description: '30,000 mile major service',
        date: null,
        odometer: null,
        cost: null,
        vendor: 'Dealership Service Center',
        invoiceNumber: null,
        notes: 'Will include transmission fluid change, spark plugs, and full inspection',
        status: 'scheduled',
        nextDueDate: new Date('2023-02-15'),
        nextDueOdometer: 30000
      },
      {
        vehicle: vehicleIds[2],
        type: 'repair',
        description: 'Check engine light diagnosis and repair',
        date: null,
        odometer: null,
        cost: null,
        vendor: 'Auto Repair Shop',
        invoiceNumber: null,
        notes: 'Vehicle showing P0301 code - possible misfire',
        status: 'in_progress',
        nextDueDate: null,
        nextDueOdometer: null
      },
      {
        vehicle: vehicleIds[1],
        type: 'tire_replacement',
        description: 'Replace all four tires',
        date: null,
        odometer: null,
        cost: null,
        vendor: 'Tire World',
        invoiceNumber: null,
        notes: 'Current tires showing significant wear',
        status: 'scheduled',
        nextDueDate: new Date('2023-03-10'),
        nextDueOdometer: 23000
      }
    ];
    
    // Insert maintenance records
    await Maintenance.insertMany(maintenanceRecords);
    
    logger.info(`Seeded ${maintenanceRecords.length} maintenance records successfully`);
  } catch (error) {
    logger.error('Error seeding maintenance records:', error);
    throw error;
  }
};

module.exports = seedMaintenance;
