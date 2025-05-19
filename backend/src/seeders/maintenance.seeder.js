/**
 * Maintenance Seeder
 * Creates initial maintenance records for vehicles
 */

const { Maintenance, MAINTENANCE_STATUS } = require('../models/maintenance.model');

/**
 * Seed maintenance records with various statuses and types
 * @param {Array} vehicles - Vehicle records to assign maintenance to
 * @param {Object} admin - Admin user for createdBy field
 * @returns {Array} Created maintenance records
 */
const seedMaintenance = async (vehicles, admin) => {
  try {
    // Clear existing maintenance records
    await Maintenance.deleteMany({});
    
    // Define maintenance types and descriptions
    const maintenanceTypes = ['routine', 'repair', 'inspection', 'other'];
    const descriptions = [
      'Oil change and filter replacement',
      'Brake system inspection and pad replacement',
      'Tire rotation and pressure check',
      'Engine diagnostics and tune-up',
      'Transmission fluid change',
      'Air conditioning system service',
      'Battery replacement',
      'Suspension system inspection',
      'Exhaust system repair',
      'Annual safety inspection',
      'Windshield wiper replacement',
      'Headlight and taillight inspection',
      'Coolant system flush',
      'Fuel system cleaning',
      'Spark plug replacement'
    ];
    
    // Sample service providers
    const serviceProviders = [
      {
        name: 'City Auto Service Center',
        contact: '+1-555-123-4567',
        address: '123 Main Street, Anytown, USA'
      },
      {
        name: 'Fleet Maintenance Specialists',
        contact: '+1-555-987-6543',
        address: '456 Industrial Blvd, Anytown, USA'
      },
      {
        name: 'QuickFix Auto Repair',
        contact: '+1-555-456-7890',
        address: '789 Service Road, Anytown, USA'
      }
    ];
    
    // Define maintenance data
    const maintenanceData = [];
    
    // Create completed maintenance records (past)
    for (let i = 0; i < 10; i++) {
      const vehicleIndex = i % vehicles.length;
      const typeIndex = i % maintenanceTypes.length;
      const descriptionIndex = i % descriptions.length;
      const providerIndex = i % serviceProviders.length;
      
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() - Math.floor(Math.random() * 60) - 30); // 30-90 days ago
      
      const completedDate = new Date(scheduledDate);
      completedDate.setDate(completedDate.getDate() + Math.floor(Math.random() * 5) + 1); // 1-5 days after scheduled
      
      maintenanceData.push({
        vehicleId: vehicles[vehicleIndex]._id,
        dateScheduled: scheduledDate,
        dateCompleted: completedDate,
        description: descriptions[descriptionIndex],
        status: MAINTENANCE_STATUS.COMPLETED,
        maintenanceType: maintenanceTypes[typeIndex],
        cost: Math.floor(Math.random() * 500) + 50, // $50-$550
        serviceProvider: serviceProviders[providerIndex],
        notes: `Completed maintenance for ${vehicles[vehicleIndex].make} ${vehicles[vehicleIndex].model}`,
        createdBy: admin._id
      });
    }
    
    // Create in-progress maintenance records (current)
    // Find vehicle with MAINTENANCE status
    const maintenanceVehicle = vehicles.find(vehicle => vehicle.status === 'maintenance');
    if (maintenanceVehicle) {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() - 2); // 2 days ago
      
      maintenanceData.push({
        vehicleId: maintenanceVehicle._id,
        dateScheduled: scheduledDate,
        dateCompleted: null,
        description: 'Major engine overhaul and transmission repair',
        status: MAINTENANCE_STATUS.IN_PROGRESS,
        maintenanceType: 'repair',
        cost: 1200, // Estimated cost
        serviceProvider: serviceProviders[0],
        notes: `In-progress major repair for ${maintenanceVehicle.make} ${maintenanceVehicle.model}`,
        createdBy: admin._id
      });
    }
    
    // Create scheduled maintenance records (future)
    for (let i = 0; i < 5; i++) {
      const vehicleIndex = i % vehicles.length;
      const typeIndex = i % maintenanceTypes.length;
      const descriptionIndex = (i + 5) % descriptions.length; // Different from completed ones
      const providerIndex = i % serviceProviders.length;
      
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 30) + 1); // Next 30 days
      
      maintenanceData.push({
        vehicleId: vehicles[vehicleIndex]._id,
        dateScheduled: scheduledDate,
        dateCompleted: null,
        description: descriptions[descriptionIndex],
        status: MAINTENANCE_STATUS.SCHEDULED,
        maintenanceType: maintenanceTypes[typeIndex],
        cost: Math.floor(Math.random() * 300) + 50, // $50-$350 estimated
        serviceProvider: serviceProviders[providerIndex],
        notes: `Scheduled maintenance for ${vehicles[vehicleIndex].make} ${vehicles[vehicleIndex].model}`,
        createdBy: admin._id
      });
    }
    
    // Create maintenance records
    const maintenanceRecords = [];
    for (const data of maintenanceData) {
      const maintenance = await Maintenance.create(data);
      maintenanceRecords.push(maintenance);
    }
    
    return maintenanceRecords;
  } catch (error) {
    console.error('Error seeding maintenance records:', error);
    throw error;
  }
};

module.exports = {
  seedMaintenance
};
