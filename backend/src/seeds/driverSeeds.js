/**
 * Driver Seed Data
 * Creates initial driver data for the application
 */

const { Driver } = require('../models/driver.model');
const { User } = require('../models/user.model');
const logger = require('../utils/logger');
const { Types } = require('mongoose');
const { ROLES } = require('../constants/roles');

/**
 * Seed drivers collection with initial data
 * @returns {Promise<void>}
 */
const seedDrivers = async () => {
  try {
    // Check if drivers already exist
    const count = await Driver.countDocuments();
    
    if (count > 0) {
      logger.info(`Skipping driver seeding. ${count} drivers already exist.`);
      return;
    }
    
    // Get driver user accounts
    const driverUsers = await User.find({ role: ROLES.DRIVER }).limit(5);
    
    // If no driver users exist, create placeholder IDs
    const userIds = driverUsers.map(user => user._id);
    if (userIds.length === 0) {
      for (let i = 0; i < 5; i++) {
        userIds.push(new Types.ObjectId());
      }
    }
    
    // Sample driver data
    const drivers = [
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '555-123-4567',
        licenseNumber: 'DL12345678',
        licenseExpiry: new Date('2024-06-30'),
        address: '123 Main St, Anytown, CA 12345',
        emergencyContact: {
          name: 'Jane Smith',
          relationship: 'Spouse',
          phone: '555-987-6543'
        },
        status: 'available',
        user: userIds[0] || new Types.ObjectId(),
        hireDate: new Date('2020-03-15'),
        drivingExperience: 5,
        performanceRating: 4.8
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '555-234-5678',
        licenseNumber: 'DL23456789',
        licenseExpiry: new Date('2023-12-15'),
        address: '456 Oak Ave, Somewhere, CA 67890',
        emergencyContact: {
          name: 'Michael Johnson',
          relationship: 'Brother',
          phone: '555-876-5432'
        },
        status: 'available',
        user: userIds[1] || new Types.ObjectId(),
        hireDate: new Date('2021-01-10'),
        drivingExperience: 3,
        performanceRating: 4.5
      },
      {
        name: 'David Williams',
        email: 'david.williams@example.com',
        phone: '555-345-6789',
        licenseNumber: 'DL34567890',
        licenseExpiry: new Date('2024-08-22'),
        address: '789 Pine Rd, Elsewhere, CA 54321',
        emergencyContact: {
          name: 'Lisa Williams',
          relationship: 'Sister',
          phone: '555-765-4321'
        },
        status: 'on_trip',
        user: userIds[2] || new Types.ObjectId(),
        hireDate: new Date('2019-11-05'),
        drivingExperience: 7,
        performanceRating: 4.9
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '555-456-7890',
        licenseNumber: 'DL45678901',
        licenseExpiry: new Date('2024-03-10'),
        address: '101 Cedar Ln, Nowhere, CA 13579',
        emergencyContact: {
          name: 'Robert Davis',
          relationship: 'Father',
          phone: '555-654-3210'
        },
        status: 'available',
        user: userIds[3] || new Types.ObjectId(),
        hireDate: new Date('2022-02-20'),
        drivingExperience: 2,
        performanceRating: 4.2
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        phone: '555-567-8901',
        licenseNumber: 'DL56789012',
        licenseExpiry: new Date('2023-10-05'),
        address: '202 Birch St, Anywhere, CA 24680',
        emergencyContact: {
          name: 'Jennifer Brown',
          relationship: 'Spouse',
          phone: '555-543-2109'
        },
        status: 'on_leave',
        user: userIds[4] || new Types.ObjectId(),
        hireDate: new Date('2020-07-15'),
        drivingExperience: 4,
        performanceRating: 4.6
      }
    ];
    
    // Insert drivers
    await Driver.insertMany(drivers);
    
    logger.info(`Seeded ${drivers.length} drivers successfully`);
  } catch (error) {
    logger.error('Error seeding drivers:', error);
    throw error;
  }
};

module.exports = seedDrivers;
