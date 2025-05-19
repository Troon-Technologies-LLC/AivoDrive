/**
 * User Seeder
 * Creates initial user accounts for different roles
 */

const { User, ROLES } = require('../models/user.model');

/**
 * Seed users with different roles
 * @returns {Object} Created users categorized by role
 */
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@aivodrive.com',
      password: 'password123',
      role: ROLES.ADMIN,
      phone: '+1234567890',
      isActive: true,
      lastLogin: new Date()
    });
    
    // Create dispatcher user
    const dispatcher = await User.create({
      name: 'Dispatcher User',
      email: 'dispatcher@aivodrive.com',
      password: 'password123',
      role: ROLES.DISPATCHER,
      phone: '+1234567891',
      isActive: true,
      lastLogin: new Date()
    });
    
    // Create multiple driver users
    const driverUsers = [];
    for (let i = 1; i <= 5; i++) {
      const driver = await User.create({
        name: `Driver ${i}`,
        email: `driver${i}@aivodrive.com`,
        password: 'password123',
        role: ROLES.DRIVER,
        phone: `+123456789${i + 1}`,
        isActive: true,
        lastLogin: i <= 3 ? new Date() : null // Some drivers haven't logged in yet
      });
      
      driverUsers.push(driver);
    }
    
    return {
      admin,
      dispatcher,
      drivers: driverUsers
    };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

module.exports = {
  seedUsers
};
