/**
 * Database Seeders
 * Populates the database with initial data for testing and development
 */

require('dotenv').config();
const connectDB = require('../config/database');
const userSeeder = require('./user.seeder');
const vehicleSeeder = require('./vehicle.seeder');
const driverSeeder = require('./driver.seeder');
const tripSeeder = require('./trip.seeder');
const maintenanceSeeder = require('./maintenance.seeder');
const fuelSeeder = require('./fuel.seeder');
const alertSeeder = require('./alert.seeder');

/**
 * Main seeder function to run all seeders
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB for seeding...');
    
    // Run seeders in sequence to maintain data integrity
    console.log('\n----- STARTING DATABASE SEEDING -----\n');
    
    // Step 1: Seed users (including admin, dispatcher, and drivers)
    console.log('Seeding users...');
    const users = await userSeeder.seedUsers();
    console.log('✅ Users seeded successfully!');
    
    // Step 2: Seed vehicles
    console.log('\nSeeding vehicles...');
    const vehicles = await vehicleSeeder.seedVehicles();
    console.log('✅ Vehicles seeded successfully!');
    
    // Step 3: Seed drivers (requires users to be seeded first)
    console.log('\nSeeding drivers...');
    const drivers = await driverSeeder.seedDrivers(users.drivers, vehicles);
    console.log('✅ Drivers seeded successfully!');
    
    // Step 4: Seed trips (requires vehicles and drivers to be seeded first)
    console.log('\nSeeding trips...');
    const trips = await tripSeeder.seedTrips(vehicles, drivers, users.admin);
    console.log('✅ Trips seeded successfully!');
    
    // Step 5: Seed maintenance records (requires vehicles to be seeded first)
    console.log('\nSeeding maintenance records...');
    const maintenance = await maintenanceSeeder.seedMaintenance(vehicles, users.admin);
    console.log('✅ Maintenance records seeded successfully!');
    
    // Step 6: Seed fuel records (requires vehicles to be seeded first)
    console.log('\nSeeding fuel records...');
    const fuelRecords = await fuelSeeder.seedFuel(vehicles, users.admin);
    console.log('✅ Fuel records seeded successfully!');
    
    // Step 6: Seed alerts
    console.log('\nSeeding alerts...');
    const alerts = await alertSeeder.seedAlerts(vehicles, drivers, trips, maintenance);
    console.log('✅ Alerts seeded successfully!');
    
    console.log('\n----- DATABASE SEEDING COMPLETED -----\n');
    console.log('You can now log in with the following credentials:');
    console.log('Admin: admin@aivodrive.com / password123');
    console.log('Dispatcher: dispatcher@aivodrive.com / password123');
    console.log('Driver: driver1@aivodrive.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
