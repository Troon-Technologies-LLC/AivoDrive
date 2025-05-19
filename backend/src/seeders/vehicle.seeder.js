/**
 * Vehicle Seeder
 * Creates initial vehicle records for the fleet
 */

const { Vehicle, VEHICLE_STATUS } = require('../models/vehicle.model');

/**
 * Seed vehicles with various makes, models, and statuses
 * @returns {Array} Created vehicle records
 */
const seedVehicles = async () => {
  try {
    // Clear existing vehicles
    await Vehicle.deleteMany({});
    
    // Define vehicle data
    const vehicleData = [
      {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        licensePlate: 'ABC-1234',
        status: VEHICLE_STATUS.ACTIVE,
        lastServiceDate: new Date(2024, 2, 15), // March 15, 2024
        fuelType: 'gasoline',
        fuelCapacity: 60,
        mileage: 15000,
        vinNumber: 'JT2BF22K1W0123456',
        registrationExpiry: new Date(2025, 11, 31), // Dec 31, 2025
        insuranceExpiry: new Date(2025, 11, 31), // Dec 31, 2025
        notes: 'Company sedan for executive transport'
      },
      {
        make: 'Ford',
        model: 'Transit',
        year: 2021,
        licensePlate: 'XYZ-5678',
        status: VEHICLE_STATUS.ACTIVE,
        lastServiceDate: new Date(2024, 4, 10), // May 10, 2024
        fuelType: 'diesel',
        fuelCapacity: 80,
        mileage: 35000,
        vinNumber: '1FTBF2B62BEA12345',
        registrationExpiry: new Date(2025, 10, 15), // Nov 15, 2025
        insuranceExpiry: new Date(2025, 10, 15), // Nov 15, 2025
        notes: 'Cargo van for deliveries'
      },
      {
        make: 'Honda',
        model: 'Civic',
        year: 2023,
        licensePlate: 'DEF-9012',
        status: VEHICLE_STATUS.ACTIVE,
        lastServiceDate: new Date(2024, 3, 20), // April 20, 2024
        fuelType: 'gasoline',
        fuelCapacity: 50,
        mileage: 8000,
        vinNumber: '2HGFG4A52FH123456',
        registrationExpiry: new Date(2026, 0, 15), // Jan 15, 2026
        insuranceExpiry: new Date(2026, 0, 15), // Jan 15, 2026
        notes: 'Compact car for city transport'
      },
      {
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        licensePlate: 'GHI-3456',
        status: VEHICLE_STATUS.ACTIVE,
        lastServiceDate: new Date(2024, 5, 5), // June 5, 2024
        fuelType: 'electric',
        fuelCapacity: 0, // Electric vehicle
        mileage: 12000,
        vinNumber: '5YJ3E1EA1JF123456',
        registrationExpiry: new Date(2026, 2, 10), // March 10, 2026
        insuranceExpiry: new Date(2026, 2, 10), // March 10, 2026
        notes: 'Electric vehicle for eco-friendly transport'
      },
      {
        make: 'Chevrolet',
        model: 'Silverado',
        year: 2022,
        licensePlate: 'JKL-7890',
        status: VEHICLE_STATUS.MAINTENANCE,
        lastServiceDate: new Date(2024, 1, 25), // Feb 25, 2024
        fuelType: 'gasoline',
        fuelCapacity: 98,
        mileage: 28000,
        vinNumber: '1GCPYBEK5MZ123456',
        registrationExpiry: new Date(2025, 9, 20), // Oct 20, 2025
        insuranceExpiry: new Date(2025, 9, 20), // Oct 20, 2025
        notes: 'Pickup truck for heavy loads, currently in maintenance for brake system'
      },
      {
        make: 'Nissan',
        model: 'Rogue',
        year: 2021,
        licensePlate: 'MNO-1234',
        status: VEHICLE_STATUS.INACTIVE,
        lastServiceDate: new Date(2023, 11, 10), // Dec 10, 2023
        fuelType: 'gasoline',
        fuelCapacity: 55,
        mileage: 45000,
        vinNumber: 'JN8AS5MV1FW123456',
        registrationExpiry: new Date(2025, 7, 5), // Aug 5, 2025
        insuranceExpiry: new Date(2025, 7, 5), // Aug 5, 2025
        notes: 'SUV currently inactive due to transmission issues'
      },
      {
        make: 'Hyundai',
        model: 'Tucson',
        year: 2022,
        licensePlate: 'PQR-5678',
        status: VEHICLE_STATUS.ACTIVE,
        lastServiceDate: new Date(2024, 4, 15), // May 15, 2024
        fuelType: 'gasoline',
        fuelCapacity: 62,
        mileage: 18000,
        vinNumber: 'KM8J3CAL6NU123456',
        registrationExpiry: new Date(2025, 8, 30), // Sep 30, 2025
        insuranceExpiry: new Date(2025, 8, 30), // Sep 30, 2025
        notes: 'Compact SUV for general transport'
      },
      {
        make: 'Mercedes-Benz',
        model: 'Sprinter',
        year: 2021,
        licensePlate: 'STU-9012',
        status: VEHICLE_STATUS.ACTIVE,
        lastServiceDate: new Date(2024, 3, 5), // April 5, 2024
        fuelType: 'diesel',
        fuelCapacity: 100,
        mileage: 40000,
        vinNumber: 'WDAPF4CC5KN123456',
        registrationExpiry: new Date(2025, 6, 15), // July 15, 2025
        insuranceExpiry: new Date(2025, 6, 15), // July 15, 2025
        notes: 'Large cargo van for equipment transport'
      }
    ];
    
    // Create vehicles
    const vehicles = [];
    for (const data of vehicleData) {
      const vehicle = await Vehicle.create(data);
      vehicles.push(vehicle);
    }
    
    return vehicles;
  } catch (error) {
    console.error('Error seeding vehicles:', error);
    throw error;
  }
};

module.exports = {
  seedVehicles
};
