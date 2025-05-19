/**
 * Report Controller
 * Handles generation of reports and statistics for the fleet management system
 */

const { Trip, TRIP_STATUS } = require('../models/trip.model');
const { Vehicle, VEHICLE_STATUS } = require('../models/vehicle.model');
const { Driver, DRIVER_STATUS } = require('../models/driver.model');
const { Maintenance, MAINTENANCE_STATUS } = require('../models/maintenance.model');
const { ROLES } = require('../constants/roles');
const { successResponse, errorResponse } = require('../utils/response.utils');

/**
 * Get daily summary report
 * @route GET /api/reports/daily-summary
 * @access Private (Admin only)
 */
const getDailySummary = async (req, res) => {
  try {
    // Only Admin can access reports
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to access reports', 403)
      );
    }
    
    // Set date range for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get trips for today
    const tripStats = await Trip.aggregate([
      {
        $match: {
          startTime: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format trip stats
    const tripsByStatus = {};
    tripStats.forEach(stat => {
      tripsByStatus[stat._id] = stat.count;
    });
    
    // Get total trips for today
    const totalTripsToday = await Trip.countDocuments({
      startTime: { $gte: today, $lt: tomorrow }
    });
    
    // Get vehicle stats
    const vehicleStats = await Vehicle.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format vehicle stats
    const vehiclesByStatus = {};
    vehicleStats.forEach(stat => {
      vehiclesByStatus[stat._id] = stat.count;
    });
    
    // Get total vehicles
    const totalVehicles = await Vehicle.countDocuments();
    
    // Get driver stats
    const driverStats = await Driver.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format driver stats
    const driversByStatus = {};
    driverStats.forEach(stat => {
      driversByStatus[stat._id] = stat.count;
    });
    
    // Get total drivers
    const totalDrivers = await Driver.countDocuments();
    
    // Get maintenance stats for today
    const maintenanceStats = await Maintenance.aggregate([
      {
        $match: {
          dateScheduled: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format maintenance stats
    const maintenanceByStatus = {};
    maintenanceStats.forEach(stat => {
      maintenanceByStatus[stat._id] = stat.count;
    });
    
    // Get total maintenance for today
    const totalMaintenanceToday = await Maintenance.countDocuments({
      dateScheduled: { $gte: today, $lt: tomorrow }
    });
    
    // Compile the daily summary report
    const dailySummary = {
      date: today,
      trips: {
        total: totalTripsToday,
        byStatus: tripsByStatus
      },
      vehicles: {
        total: totalVehicles,
        byStatus: vehiclesByStatus,
        active: vehiclesByStatus[VEHICLE_STATUS.ACTIVE] || 0,
        maintenance: vehiclesByStatus[VEHICLE_STATUS.MAINTENANCE] || 0,
        inactive: vehiclesByStatus[VEHICLE_STATUS.INACTIVE] || 0
      },
      drivers: {
        total: totalDrivers,
        byStatus: driversByStatus,
        available: driversByStatus[DRIVER_STATUS.AVAILABLE] || 0,
        onTrip: driversByStatus[DRIVER_STATUS.ON_TRIP] || 0,
        offDuty: driversByStatus[DRIVER_STATUS.OFF_DUTY] || 0,
        inactive: driversByStatus[DRIVER_STATUS.INACTIVE] || 0
      },
      maintenance: {
        total: totalMaintenanceToday,
        byStatus: maintenanceByStatus,
        scheduled: maintenanceByStatus[MAINTENANCE_STATUS.SCHEDULED] || 0,
        inProgress: maintenanceByStatus[MAINTENANCE_STATUS.IN_PROGRESS] || 0,
        completed: maintenanceByStatus[MAINTENANCE_STATUS.COMPLETED] || 0
      }
    };
    
    res.status(200).json(
      successResponse('Daily summary report retrieved successfully', { dailySummary }, 200)
    );
  } catch (error) {
    console.error('Get daily summary error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Get maintenance due report
 * @route GET /api/reports/maintenance-due
 * @access Private (Admin only)
 */
const getMaintenanceDue = async (req, res) => {
  try {
    // Only Admin can access reports
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to access reports', 403)
      );
    }
    
    // Get current date
    const today = new Date();
    
    // Get vehicles that need maintenance (last service date > 3 months ago)
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    const vehiclesDueForMaintenance = await Vehicle.find({
      $or: [
        { lastServiceDate: { $lt: threeMonthsAgo } },
        { lastServiceDate: null }
      ]
    })
    .populate('currentDriver', 'name email phone')
    .sort({ lastServiceDate: 1 });
    
    // Get scheduled maintenance for the next 30 days
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const upcomingMaintenance = await Maintenance.find({
      dateScheduled: { $gte: today, $lte: thirtyDaysFromNow },
      status: MAINTENANCE_STATUS.SCHEDULED
    })
    .populate('vehicleId', 'make model licensePlate year')
    .sort({ dateScheduled: 1 });
    
    // Get overdue maintenance
    const overdueMaintenance = await Maintenance.find({
      dateScheduled: { $lt: today },
      status: MAINTENANCE_STATUS.SCHEDULED
    })
    .populate('vehicleId', 'make model licensePlate year')
    .sort({ dateScheduled: 1 });
    
    // Compile the maintenance due report
    const maintenanceDueReport = {
      vehiclesDueForService: vehiclesDueForMaintenance,
      upcomingMaintenance,
      overdueMaintenance,
      summary: {
        vehiclesDueCount: vehiclesDueForMaintenance.length,
        upcomingMaintenanceCount: upcomingMaintenance.length,
        overdueMaintenanceCount: overdueMaintenance.length
      }
    };
    
    res.status(200).json(
      successResponse('Maintenance due report retrieved successfully', { maintenanceDueReport }, 200)
    );
  } catch (error) {
    console.error('Get maintenance due error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Get fleet performance report
 * @route GET /api/reports/fleet-performance
 * @access Private (Admin only)
 */
const getFleetPerformance = async (req, res) => {
  try {
    // Only Admin can access reports
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to access reports', 403)
      );
    }
    
    // Get date range (default to last 30 days)
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 30);
    
    // Get trips completed in the date range
    const completedTrips = await Trip.find({
      status: TRIP_STATUS.COMPLETED,
      startTime: { $gte: startDate, $lte: endDate }
    })
    .populate('vehicleId', 'make model licensePlate')
    .populate({
      path: 'driverId',
      populate: {
        path: 'userId',
        select: 'name'
      }
    });
    
    // Calculate total distance and average distance per trip
    let totalDistance = 0;
    completedTrips.forEach(trip => {
      totalDistance += trip.actualDistance || 0;
    });
    
    const avgDistance = completedTrips.length > 0 ? totalDistance / completedTrips.length : 0;
    
    // Get top performing drivers (by number of completed trips)
    const driverPerformance = await Trip.aggregate([
      {
        $match: {
          status: TRIP_STATUS.COMPLETED,
          startTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$driverId',
          tripCount: { $sum: 1 },
          totalDistance: { $sum: '$actualDistance' }
        }
      },
      {
        $sort: { tripCount: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Get driver details for top performers
    const topDrivers = [];
    for (const driver of driverPerformance) {
      const driverDetails = await Driver.findById(driver._id)
        .populate('userId', 'name');
      
      if (driverDetails) {
        topDrivers.push({
          driver: driverDetails,
          tripCount: driver.tripCount,
          totalDistance: driver.totalDistance,
          avgDistance: driver.totalDistance / driver.tripCount
        });
      }
    }
    
    // Get vehicle utilization
    const vehicleUtilization = await Trip.aggregate([
      {
        $match: {
          startTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$vehicleId',
          tripCount: { $sum: 1 },
          totalDistance: { $sum: '$actualDistance' }
        }
      },
      {
        $sort: { tripCount: -1 }
      }
    ]);
    
    // Get vehicle details for utilization
    const vehicleStats = [];
    for (const vehicle of vehicleUtilization) {
      const vehicleDetails = await Vehicle.findById(vehicle._id);
      
      if (vehicleDetails) {
        vehicleStats.push({
          vehicle: vehicleDetails,
          tripCount: vehicle.tripCount,
          totalDistance: vehicle.totalDistance
        });
      }
    }
    
    // Compile the fleet performance report
    const fleetPerformanceReport = {
      dateRange: {
        start: startDate,
        end: endDate
      },
      tripStats: {
        totalTrips: completedTrips.length,
        totalDistance,
        avgDistance
      },
      topDrivers,
      vehicleUtilization: vehicleStats
    };
    
    res.status(200).json(
      successResponse('Fleet performance report retrieved successfully', { fleetPerformanceReport }, 200)
    );
  } catch (error) {
    console.error('Get fleet performance error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

module.exports = {
  getDailySummary,
  getMaintenanceDue,
  getFleetPerformance
};
