/**
 * User Seed Data
 * Creates initial user accounts for the application
 */

const { User } = require('../models/user.model');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { ROLES } = require('../constants/roles');

/**
 * Seed users collection with initial data
 * @returns {Promise<void>}
 */
const seedUsers = async () => {
  try {
    // Check if users already exist
    const count = await User.countDocuments();
    
    if (count > 0) {
      logger.info(`Skipping user seeding. ${count} users already exist.`);
      return;
    }
    
    // Hash password for all users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);
    
    // Sample user data
    const users = [
      {
        name: 'Admin User',
        email: 'admin@aivodrive.com',
        password: hashedPassword,
        role: ROLES.ADMIN,
        phone: '555-100-1000',
        isActive: true,
        lastLogin: new Date()
      },
      {
        name: 'Dispatcher User',
        email: 'dispatcher@aivodrive.com',
        password: hashedPassword,
        role: ROLES.DISPATCHER,
        phone: '555-200-2000',
        isActive: true,
        lastLogin: new Date()
      },
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: hashedPassword,
        role: ROLES.DRIVER,
        phone: '555-123-4567',
        isActive: true,
        lastLogin: new Date()
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        password: hashedPassword,
        role: ROLES.DRIVER,
        phone: '555-234-5678',
        isActive: true,
        lastLogin: new Date()
      },
      {
        name: 'David Williams',
        email: 'david.williams@example.com',
        password: hashedPassword,
        role: ROLES.DRIVER,
        phone: '555-345-6789',
        isActive: true,
        lastLogin: new Date()
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        password: hashedPassword,
        role: ROLES.DRIVER,
        phone: '555-456-7890',
        isActive: true,
        lastLogin: new Date()
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        password: hashedPassword,
        role: ROLES.DRIVER,
        phone: '555-567-8901',
        isActive: true,
        lastLogin: new Date()
      }
    ];
    
    // Insert users
    await User.insertMany(users);
    
    logger.info(`Seeded ${users.length} users successfully`);
  } catch (error) {
    logger.error('Error seeding users:', error);
    throw error;
  }
};

module.exports = seedUsers;
