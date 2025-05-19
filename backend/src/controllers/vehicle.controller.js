/**
 * Vehicle Controller
 * Handles CRUD operations for vehicle management
 */

const { Vehicle, VEHICLE_STATUS } = require('../models/vehicle.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

/**
 * Get all vehicles with pagination
 * @route GET /api/vehicles
 * @access Private (Admin only)
 */
const getVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    
    // Build query
    const query = {};
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { licensePlate: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter if provided
    if (status && Object.values(VEHICLE_STATUS).includes(status)) {
      query.status = status;
    }
    
    // Execute query with pagination
    const vehicles = await Vehicle.find(query)
      .populate('currentDriver', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Vehicle.countDocuments(query);
    
    res.status(200).json(
      paginatedResponse(vehicles, page, limit, total, 'Vehicles retrieved successfully')
    );
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Get vehicle by ID
 * @route GET /api/vehicles/:id
 * @access Private (Admin only)
 */
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('currentDriver', 'name email phone');
    
    if (!vehicle) {
      return res.status(404).json(
        errorResponse('Vehicle not found', 404)
      );
    }
    
    res.status(200).json(
      successResponse('Vehicle retrieved successfully', { vehicle }, 200)
    );
  } catch (error) {
    console.error('Get vehicle by ID error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Create new vehicle
 * @route POST /api/vehicles
 * @access Private (Admin only)
 */
const createVehicle = async (req, res) => {
  try {
    const { 
      make, 
      model, 
      year, 
      licensePlate, 
      status, 
      lastServiceDate,
      currentDriver,
      fuelType,
      fuelCapacity,
      mileage,
      vinNumber,
      registrationExpiry,
      insuranceExpiry,
      notes
    } = req.body;
    
    // Check if license plate already exists
    const existingVehicle = await Vehicle.findOne({ licensePlate });
    if (existingVehicle) {
      return res.status(400).json(
        errorResponse('Vehicle with this license plate already exists', 400)
      );
    }
    
    // Create new vehicle
    const vehicle = await Vehicle.create({
      make, 
      model, 
      year, 
      licensePlate, 
      status: status || VEHICLE_STATUS.ACTIVE, 
      lastServiceDate: lastServiceDate || null,
      currentDriver: currentDriver || null,
      fuelType,
      fuelCapacity,
      mileage,
      vinNumber,
      registrationExpiry,
      insuranceExpiry,
      notes
    });
    
    res.status(201).json(
      successResponse('Vehicle created successfully', { vehicle }, 201)
    );
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Update vehicle by ID
 * @route PUT /api/vehicles/:id
 * @access Private (Admin only)
 */
const updateVehicle = async (req, res) => {
  try {
    const { 
      make, 
      model, 
      year, 
      licensePlate, 
      status, 
      lastServiceDate,
      currentDriver,
      fuelType,
      fuelCapacity,
      mileage,
      vinNumber,
      registrationExpiry,
      insuranceExpiry,
      notes
    } = req.body;
    
    // Check if vehicle exists
    let vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json(
        errorResponse('Vehicle not found', 404)
      );
    }
    
    // Check if license plate is being changed and already exists
    if (licensePlate && licensePlate !== vehicle.licensePlate) {
      const existingVehicle = await Vehicle.findOne({ licensePlate });
      if (existingVehicle) {
        return res.status(400).json(
          errorResponse('Vehicle with this license plate already exists', 400)
        );
      }
    }
    
    // Update vehicle
    vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        make, 
        model, 
        year, 
        licensePlate, 
        status, 
        lastServiceDate,
        currentDriver,
        fuelType,
        fuelCapacity,
        mileage,
        vinNumber,
        registrationExpiry,
        insuranceExpiry,
        notes
      },
      { new: true, runValidators: true }
    ).populate('currentDriver', 'name email phone');
    
    res.status(200).json(
      successResponse('Vehicle updated successfully', { vehicle }, 200)
    );
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Delete vehicle by ID
 * @route DELETE /api/vehicles/:id
 * @access Private (Admin only)
 */
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json(
        errorResponse('Vehicle not found', 404)
      );
    }
    
    // Check if vehicle is currently assigned to a driver
    if (vehicle.currentDriver) {
      return res.status(400).json(
        errorResponse('Cannot delete vehicle that is currently assigned to a driver', 400)
      );
    }
    
    await vehicle.deleteOne();
    
    res.status(200).json(
      successResponse('Vehicle deleted successfully', null, 200)
    );
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Get vehicle statistics
 * @route GET /api/vehicles/stats
 * @access Private (Admin only)
 */
const getVehicleStats = async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await Vehicle.aggregate([
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
    const totalVehicles = await Vehicle.countDocuments();
    
    // Get vehicles requiring maintenance (e.g., last service date > 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const maintenanceDue = await Vehicle.countDocuments({
      lastServiceDate: { $lt: threeMonthsAgo }
    });
    
    // Get vehicles with expiring documents
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    
    const expiringRegistration = await Vehicle.countDocuments({
      registrationExpiry: { $lt: oneMonthFromNow, $gt: new Date() }
    });
    
    const expiringInsurance = await Vehicle.countDocuments({
      insuranceExpiry: { $lt: oneMonthFromNow, $gt: new Date() }
    });
    
    const stats = {
      total: totalVehicles,
      byStatus: statusStats,
      maintenanceDue,
      expiringRegistration,
      expiringInsurance
    };
    
    res.status(200).json(
      successResponse('Vehicle statistics retrieved successfully', { stats }, 200)
    );
  } catch (error) {
    console.error('Get vehicle stats error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleStats
};
