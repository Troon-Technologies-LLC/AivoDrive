/**
 * Trip Controller
 * Handles CRUD operations for trip management
 */

const { Trip, TRIP_STATUS } = require('../models/trip.model');
const { Driver, DRIVER_STATUS } = require('../models/driver.model');
const { Vehicle, VEHICLE_STATUS } = require('../models/vehicle.model');
const { ROLES } = require('../constants/roles');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

/**
 * Get all trips with pagination and role-based filtering
 * @route GET /api/trips
 * @access Private (All roles with different access levels)
 */
const getTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';
    
    // Build query
    const query = {};
    
    // Role-based filtering
    if (req.user.role === ROLES.DRIVER) {
      // Drivers can only see their own trips
      // Find driver document for the current user
      const driver = await Driver.findOne({ userId: req.user._id });
      if (!driver) {
        return res.status(404).json(
          errorResponse('Driver profile not found', 404)
        );
      }
      query.driverId = driver._id;
    }
    
    // Add status filter if provided
    if (status && Object.values(TRIP_STATUS).includes(status)) {
      query.status = status;
    }
    
    // Add date range filter if provided
    if (startDate) {
      query.startTime = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      if (!query.startTime) query.startTime = {};
      query.startTime.$lte = new Date(endDate);
    }
    
    // Execute query with pagination
    const trips = await Trip.find(query)
      .populate('vehicleId', 'make model licensePlate')
      .populate({
        path: 'driverId',
        populate: {
          path: 'userId',
          select: 'name email phone'
        }
      })
      .populate('createdBy', 'name email')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);
    
    // Filter by search term if provided
    let filteredTrips = trips;
    if (search) {
      filteredTrips = trips.filter(trip => 
        (trip.origin.name && trip.origin.name.toLowerCase().includes(search.toLowerCase())) ||
        (trip.destination.name && trip.destination.name.toLowerCase().includes(search.toLowerCase())) ||
        (trip.vehicleId && trip.vehicleId.licensePlate && trip.vehicleId.licensePlate.toLowerCase().includes(search.toLowerCase())) ||
        (trip.driverId && trip.driverId.userId && trip.driverId.userId.name && trip.driverId.userId.name.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Get total count for pagination
    const total = search ? filteredTrips.length : await Trip.countDocuments(query);
    
    res.status(200).json(
      paginatedResponse(filteredTrips, page, limit, total, 'Trips retrieved successfully')
    );
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Get trip by ID
 * @route GET /api/trips/:id
 * @access Private (All roles with different access levels)
 */
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicleId', 'make model licensePlate year')
      .populate({
        path: 'driverId',
        populate: {
          path: 'userId',
          select: 'name email phone'
        }
      })
      .populate('createdBy', 'name email');
    
    if (!trip) {
      return res.status(404).json(
        errorResponse('Trip not found', 404)
      );
    }
    
    // Role-based access control
    if (req.user.role === ROLES.DRIVER) {
      // Drivers can only view their own trips
      const driver = await Driver.findOne({ userId: req.user._id });
      if (!driver || trip.driverId._id.toString() !== driver._id.toString()) {
        return res.status(403).json(
          errorResponse('Not authorized to access this trip', 403)
        );
      }
    }
    
    res.status(200).json(
      successResponse('Trip retrieved successfully', { trip }, 200)
    );
  } catch (error) {
    console.error('Get trip by ID error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Create new trip
 * @route POST /api/trips
 * @access Private (Admin and Dispatcher only)
 */
const createTrip = async (req, res) => {
  try {
    // Only Admin and Dispatcher can create trips
    if (![ROLES.ADMIN, ROLES.DISPATCHER].includes(req.user.role)) {
      return res.status(403).json(
        errorResponse('Not authorized to create trips', 403)
      );
    }
    
    const { 
      vehicleId, 
      driverId, 
      origin, 
      destination, 
      startTime, 
      endTime,
      estimatedDistance,
      status,
      route,
      notes,
      purpose
    } = req.body;
    
    // Validate required fields
    if (!vehicleId || !driverId || !origin || !destination || !startTime) {
      return res.status(400).json(
        errorResponse('Please provide all required fields', 400)
      );
    }
    
    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json(
        errorResponse('Vehicle not found', 404)
      );
    }
    
    if (vehicle.status !== VEHICLE_STATUS.ACTIVE) {
      return res.status(400).json(
        errorResponse(`Vehicle is not active, current status: ${vehicle.status}`, 400)
      );
    }
    
    // Check if driver exists and is available
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json(
        errorResponse('Driver not found', 404)
      );
    }
    
    if (driver.status !== DRIVER_STATUS.AVAILABLE) {
      return res.status(400).json(
        errorResponse(`Driver is not available, current status: ${driver.status}`, 400)
      );
    }
    
    // Create trip
    const trip = await Trip.create({
      vehicleId,
      driverId,
      origin,
      destination,
      startTime,
      endTime: endTime || null,
      estimatedDistance: estimatedDistance || 0,
      status: status || TRIP_STATUS.SCHEDULED,
      route: route || '',
      notes,
      purpose,
      createdBy: req.user._id
    });
    
    // Update driver status if trip is starting immediately
    if (status === TRIP_STATUS.IN_PROGRESS) {
      await Driver.findByIdAndUpdate(driverId, { status: DRIVER_STATUS.ON_TRIP });
    }
    
    // Populate references for response
    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicleId', 'make model licensePlate')
      .populate({
        path: 'driverId',
        populate: {
          path: 'userId',
          select: 'name email phone'
        }
      })
      .populate('createdBy', 'name email');
    
    res.status(201).json(
      successResponse('Trip created successfully', { trip: populatedTrip }, 201)
    );
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Update trip by ID
 * @route PUT /api/trips/:id
 * @access Private (All roles with different access levels)
 */
const updateTrip = async (req, res) => {
  try {
    const { 
      vehicleId, 
      driverId, 
      origin, 
      destination, 
      startTime, 
      endTime,
      actualDistance,
      status,
      route,
      notes,
      purpose
    } = req.body;
    
    // Check if trip exists
    let trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json(
        errorResponse('Trip not found', 404)
      );
    }
    
    // Role-based access control and update limitations
    if (req.user.role === ROLES.DRIVER) {
      // Drivers can only update status and actual distance of their own trips
      const driver = await Driver.findOne({ userId: req.user._id });
      if (!driver || trip.driverId.toString() !== driver._id.toString()) {
        return res.status(403).json(
          errorResponse('Not authorized to update this trip', 403)
        );
      }
      
      // Drivers can only update status and actual distance
      const allowedUpdates = ['status', 'actualDistance', 'notes'];
      const requestedUpdates = Object.keys(req.body);
      
      const isValidOperation = requestedUpdates.every(update => allowedUpdates.includes(update));
      
      if (!isValidOperation) {
        return res.status(400).json(
          errorResponse('Drivers can only update status, actual distance, and notes', 400)
        );
      }
      
      // Handle status change
      if (status && status !== trip.status) {
        // Only allow specific status transitions for drivers
        const allowedStatusTransitions = {
          [TRIP_STATUS.SCHEDULED]: [TRIP_STATUS.IN_PROGRESS],
          [TRIP_STATUS.IN_PROGRESS]: [TRIP_STATUS.COMPLETED]
        };
        
        if (!allowedStatusTransitions[trip.status] || !allowedStatusTransitions[trip.status].includes(status)) {
          return res.status(400).json(
            errorResponse(`Cannot change trip status from ${trip.status} to ${status}`, 400)
          );
        }
        
        // Update driver status based on trip status
        if (status === TRIP_STATUS.IN_PROGRESS) {
          await Driver.findByIdAndUpdate(trip.driverId, { status: DRIVER_STATUS.ON_TRIP });
        } else if (status === TRIP_STATUS.COMPLETED) {
          await Driver.findByIdAndUpdate(trip.driverId, { status: DRIVER_STATUS.AVAILABLE });
          
          // If trip is completed, update driver stats
          if (actualDistance) {
            await Driver.findByIdAndUpdate(trip.driverId, {
              $inc: { totalTrips: 1, totalDistance: actualDistance }
            });
          }
        }
      }
    } else if ([ROLES.ADMIN, ROLES.DISPATCHER].includes(req.user.role)) {
      // Admin and Dispatcher can update all fields
      
      // Handle vehicle change
      if (vehicleId && vehicleId !== trip.vehicleId.toString()) {
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
          return res.status(404).json(
            errorResponse('Vehicle not found', 404)
          );
        }
        
        if (vehicle.status !== VEHICLE_STATUS.ACTIVE) {
          return res.status(400).json(
            errorResponse(`Vehicle is not active, current status: ${vehicle.status}`, 400)
          );
        }
      }
      
      // Handle driver change
      if (driverId && driverId !== trip.driverId.toString()) {
        const driver = await Driver.findById(driverId);
        if (!driver) {
          return res.status(404).json(
            errorResponse('Driver not found', 404)
          );
        }
        
        if (driver.status !== DRIVER_STATUS.AVAILABLE) {
          return res.status(400).json(
            errorResponse(`Driver is not available, current status: ${driver.status}`, 400)
          );
        }
        
        // Update old driver status if trip was in progress
        if (trip.status === TRIP_STATUS.IN_PROGRESS) {
          await Driver.findByIdAndUpdate(trip.driverId, { status: DRIVER_STATUS.AVAILABLE });
        }
      }
      
      // Handle status change
      if (status && status !== trip.status) {
        // Update driver status based on trip status
        if (status === TRIP_STATUS.IN_PROGRESS) {
          await Driver.findByIdAndUpdate(driverId || trip.driverId, { status: DRIVER_STATUS.ON_TRIP });
        } else if ([TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELLED].includes(status)) {
          await Driver.findByIdAndUpdate(driverId || trip.driverId, { status: DRIVER_STATUS.AVAILABLE });
          
          // If trip is completed, update driver stats
          if (status === TRIP_STATUS.COMPLETED && (actualDistance || trip.actualDistance)) {
            await Driver.findByIdAndUpdate(driverId || trip.driverId, {
              $inc: { totalTrips: 1, totalDistance: actualDistance || trip.actualDistance }
            });
          }
        }
      }
    }
    
    // Update trip
    trip = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        vehicleId,
        driverId,
        origin,
        destination,
        startTime,
        endTime,
        actualDistance,
        status,
        route,
        notes,
        purpose
      },
      { new: true, runValidators: true }
    )
    .populate('vehicleId', 'make model licensePlate')
    .populate({
      path: 'driverId',
      populate: {
        path: 'userId',
        select: 'name email phone'
      }
    })
    .populate('createdBy', 'name email');
    
    res.status(200).json(
      successResponse('Trip updated successfully', { trip }, 200)
    );
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Delete trip by ID
 * @route DELETE /api/trips/:id
 * @access Private (Admin only)
 */
const deleteTrip = async (req, res) => {
  try {
    // Only Admin can delete trips
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to delete trips', 403)
      );
    }
    
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json(
        errorResponse('Trip not found', 404)
      );
    }
    
    // If trip is in progress, update driver status
    if (trip.status === TRIP_STATUS.IN_PROGRESS) {
      await Driver.findByIdAndUpdate(trip.driverId, { status: DRIVER_STATUS.AVAILABLE });
    }
    
    await Trip.findByIdAndDelete(req.params.id);
    
    res.status(200).json(
      successResponse('Trip deleted successfully', null, 200)
    );
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Get trip statistics
 * @route GET /api/trips/stats
 * @access Private (Admin and Dispatcher)
 */
const getTripStats = async (req, res) => {
  try {
    // Only Admin and Dispatcher can view trip stats
    if (![ROLES.ADMIN, ROLES.DISPATCHER].includes(req.user.role)) {
      return res.status(403).json(
        errorResponse('Not authorized to view trip statistics', 403)
      );
    }
    
    // Get counts by status
    const statusCounts = await Trip.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format status counts
    const statusStats = {};
    statusCounts.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });
    
    // Get total count
    const totalTrips = await Trip.countDocuments();
    
    // Get trips for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayTrips = await Trip.countDocuments({
      startTime: { $gte: today, $lt: tomorrow }
    });
    
    // Get trips for this week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    const weekTrips = await Trip.countDocuments({
      startTime: { $gte: startOfWeek, $lt: endOfWeek }
    });
    
    // Get total distance
    const distanceStats = await Trip.aggregate([
      {
        $match: { status: TRIP_STATUS.COMPLETED }
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$actualDistance' },
          avgDistance: { $avg: '$actualDistance' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const stats = {
      total: totalTrips,
      byStatus: statusStats,
      today: todayTrips,
      thisWeek: weekTrips,
      distance: distanceStats.length > 0 ? {
        total: distanceStats[0].totalDistance,
        average: distanceStats[0].avgDistance,
        completedTrips: distanceStats[0].count
      } : {
        total: 0,
        average: 0,
        completedTrips: 0
      }
    };
    
    res.status(200).json(
      successResponse('Trip statistics retrieved successfully', { stats }, 200)
    );
  } catch (error) {
    console.error('Get trip stats error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripStats
};
