/**
 * Seed Data Index
 * Coordinates seeding of all data collections
 */

const mongoose = require('mongoose');
require('dotenv').config();
const seedVehicles = require('./vehicleSeeds');
const seedDrivers = require('./driverSeeds');
const seedTrips = require('./tripSeeds');
const seedMaintenance = require('./maintenanceSeeds');
const seedFuelRecords = require('./fuelSeeds');
const seedUsers = require('./userSeeds');
const logger = require('../utils/logger');

/**
 * Main seed function that coordinates seeding of all collections
 * @param {boolean} disconnect - Whether to disconnect from MongoDB after seeding (default: true)
 */
const seedDatabase = async (disconnect = true) => {
  try {
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aivodrive';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    logger.info('Connected to MongoDB for seeding');
    
    // Seed all collections
    await seedUsers();
    await seedDrivers();
    await seedVehicles();
    await seedTrips();
    await seedMaintenance();
    await seedFuelRecords();
    
    logger.info('Database seeding completed successfully');
    
    // Disconnect from database only if requested
    if (disconnect) {
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB after seeding');
    }
    
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    logger.error('Error seeding database:', error);
    
    // Ensure disconnection even on error, but only if requested
    if (disconnect) {
      try {
        await mongoose.disconnect();
      } catch (disconnectError) {
        logger.error('Error disconnecting from MongoDB:', disconnectError);
      }
    }
    
    // Return error information instead of throwing
    return { success: false, error: error.message };
  }
};

// If this script is run directly (not imported)
if (require.main === module) {
  seedDatabase()
    .then(result => {
      if (result.success) {
        logger.info(result.message);
        process.exit(0);
      } else {
        logger.error(result.error);
        process.exit(1);
      }
    });
}

module.exports = seedDatabase;
