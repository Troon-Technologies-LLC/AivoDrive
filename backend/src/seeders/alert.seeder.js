/**
 * Alert Seeder
 * Creates initial alert records for the system
 */

const { Alert, ALERT_TYPE, ALERT_PRIORITY } = require('../models/alert.model');

/**
 * Seed alerts with various types and priorities
 * @param {Array} vehicles - Vehicle records to reference in alerts
 * @param {Array} drivers - Driver records to reference in alerts
 * @param {Array} trips - Trip records to reference in alerts
 * @param {Array} maintenance - Maintenance records to reference in alerts
 * @returns {Array} Created alert records
 */
const seedAlerts = async (vehicles, drivers, trips, maintenance) => {
  try {
    // Clear existing alerts
    await Alert.deleteMany({});
    
    // Define alert data
    const alertData = [];
    
    // 1. Vehicle maintenance due alerts
    const vehiclesDue = vehicles.filter(vehicle => {
      if (!vehicle.lastServiceDate) return true;
      
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      return vehicle.lastServiceDate < threeMonthsAgo;
    });
    
    for (const vehicle of vehiclesDue) {
      alertData.push({
        type: ALERT_TYPE.MAINTENANCE_DUE,
        title: `Maintenance Due: ${vehicle.make} ${vehicle.model}`,
        message: `Vehicle ${vehicle.licensePlate} is due for maintenance. Last service was ${vehicle.lastServiceDate ? vehicle.lastServiceDate.toLocaleDateString() : 'never'}.`,
        priority: ALERT_PRIORITY.MEDIUM,
        isRead: false,
        relatedTo: {
          model: 'Vehicle',
          id: vehicle._id
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });
    }
    
    // 2. Vehicle registration expiry alerts
    const vehiclesRegistrationExpiring = vehicles.filter(vehicle => {
      if (!vehicle.registrationExpiry) return false;
      
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      return vehicle.registrationExpiry < thirtyDaysFromNow && vehicle.registrationExpiry > new Date();
    });
    
    for (const vehicle of vehiclesRegistrationExpiring) {
      alertData.push({
        type: ALERT_TYPE.VEHICLE_REGISTRATION_EXPIRY,
        title: `Registration Expiring: ${vehicle.make} ${vehicle.model}`,
        message: `Vehicle ${vehicle.licensePlate} registration expires on ${vehicle.registrationExpiry.toLocaleDateString()}.`,
        priority: ALERT_PRIORITY.HIGH,
        isRead: false,
        relatedTo: {
          model: 'Vehicle',
          id: vehicle._id
        },
        expiresAt: vehicle.registrationExpiry
      });
    }
    
    // 3. Vehicle insurance expiry alerts
    const vehiclesInsuranceExpiring = vehicles.filter(vehicle => {
      if (!vehicle.insuranceExpiry) return false;
      
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      return vehicle.insuranceExpiry < thirtyDaysFromNow && vehicle.insuranceExpiry > new Date();
    });
    
    for (const vehicle of vehiclesInsuranceExpiring) {
      alertData.push({
        type: ALERT_TYPE.VEHICLE_INSURANCE_EXPIRY,
        title: `Insurance Expiring: ${vehicle.make} ${vehicle.model}`,
        message: `Vehicle ${vehicle.licensePlate} insurance expires on ${vehicle.insuranceExpiry.toLocaleDateString()}.`,
        priority: ALERT_PRIORITY.HIGH,
        isRead: false,
        relatedTo: {
          model: 'Vehicle',
          id: vehicle._id
        },
        expiresAt: vehicle.insuranceExpiry
      });
    }
    
    // 4. Driver license expiry alerts
    const driversLicenseExpiring = drivers.filter(driver => {
      if (!driver.licenseExpiry) return false;
      
      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
      
      return driver.licenseExpiry < sixtyDaysFromNow && driver.licenseExpiry > new Date();
    });
    
    for (const driver of driversLicenseExpiring) {
      alertData.push({
        type: ALERT_TYPE.DRIVER_LICENSE_EXPIRY,
        title: `License Expiring: Driver ${driver.licenseNumber}`,
        message: `Driver license ${driver.licenseNumber} expires on ${driver.licenseExpiry.toLocaleDateString()}.`,
        priority: ALERT_PRIORITY.MEDIUM,
        isRead: false,
        relatedTo: {
          model: 'Driver',
          id: driver._id
        },
        expiresAt: driver.licenseExpiry
      });
    }
    
    // 5. Trip delay alerts
    const delayedTrips = trips.filter(trip => 
      trip.status === 'in_progress' && 
      new Date(trip.startTime).getTime() + (3 * 60 * 60 * 1000) < Date.now() // More than 3 hours since start
    );
    
    for (const trip of delayedTrips) {
      alertData.push({
        type: ALERT_TYPE.TRIP_DELAY,
        title: `Trip Delay Alert`,
        message: `Trip from ${trip.origin.name} to ${trip.destination.name} has been in progress for over 3 hours.`,
        priority: ALERT_PRIORITY.MEDIUM,
        isRead: false,
        relatedTo: {
          model: 'Trip',
          id: trip._id
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });
    }
    
    // 6. Overdue maintenance alerts
    const overdueMaintenance = maintenance.filter(record => 
      record.status === 'scheduled' && record.dateScheduled < new Date()
    );
    
    for (const record of overdueMaintenance) {
      alertData.push({
        type: ALERT_TYPE.MAINTENANCE_DUE,
        title: `Overdue Maintenance`,
        message: `Scheduled maintenance (${record.description}) was due on ${record.dateScheduled.toLocaleDateString()} and is now overdue.`,
        priority: ALERT_PRIORITY.HIGH,
        isRead: false,
        relatedTo: {
          model: 'Maintenance',
          id: record._id
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });
    }
    
    // 7. Add a system alert
    alertData.push({
      type: ALERT_TYPE.SYSTEM,
      title: 'Welcome to AivoDrive',
      message: 'Welcome to the AivoDrive Fleet Management System. This is your alert center where you will receive important notifications about your fleet.',
      priority: ALERT_PRIORITY.LOW,
      isRead: false,
      relatedTo: {
        model: 'User',
        id: '000000000000000000000000' // Placeholder ID
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    
    // Create alerts
    const alerts = [];
    for (const data of alertData) {
      const alert = await Alert.create(data);
      alerts.push(alert);
    }
    
    return alerts;
  } catch (error) {
    console.error('Error seeding alerts:', error);
    throw error;
  }
};

module.exports = {
  seedAlerts
};
