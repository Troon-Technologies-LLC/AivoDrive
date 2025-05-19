/**
 * Driver Controller
 * Handles CRUD operations for driver management
 */

const { User, ROLES } = require('../models/user.model');
const { Driver, DRIVER_STATUS } = require('../models/driver.model');
const { Vehicle } = require('../models/vehicle.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

/**
 * Get all drivers with pagination
 * @route GET /api/drivers
 * @access Private (Admin only)
 */
const getDrivers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    
    // Build query
    const query = {};
    
    // Add status filter if provided
    if (status && Object.values(DRIVER_STATUS).includes(status)) {
      query.status = status;
    }
    
    // Execute query with pagination
    const drivers = await Driver.find(query)
      .populate('user', 'name email phone')
      .populate('assignedVehicle', 'make model licensePlate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // If search is provided, filter users and then find matching drivers
    let filteredDrivers = drivers;
    if (search) {
      // Find users matching search criteria
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ],
        role: ROLES.DRIVER
      });
      
      const userIds = users.map(user => user._id.toString());
      
      // Filter drivers based on matching user IDs
      filteredDrivers = drivers.filter(driver => 
        userIds.includes(driver.user._id.toString()) ||
        (driver.licenseNumber && driver.licenseNumber.includes(search))
      );
    }
    
    // Get total count for pagination
    const total = search ? filteredDrivers.length : await Driver.countDocuments(query);
    
    res.status(200).json(
      paginatedResponse(filteredDrivers, page, limit, total, 'Drivers retrieved successfully')
    );
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Get driver by ID
 * @route GET /api/drivers/:id
 * @access Private (Admin only)
 */
const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedVehicle', 'make model licensePlate year');
    
    if (!driver) {
      return res.status(404).json(
        errorResponse('Driver not found', 404)
      );
    }
    
    res.status(200).json(
      successResponse('Driver retrieved successfully', { driver }, 200)
    );
  } catch (error) {
    console.error('Get driver by ID error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Create new driver
 * @route POST /api/drivers
 * @access Private (Admin only)
 */
const createDriver = async (req, res) => {
  try {
    const { 
      name,
      email,
      password,
      phone,
      licenseNumber,
      licenseExpiry,
      assignedVehicle,
      status,
      address,
      emergencyContact,
      notes
    } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(
        errorResponse('User with this email already exists', 400)
      );
    }
    
    // Check if license number already exists
    const existingDriver = await Driver.findOne({ licenseNumber });
    if (existingDriver) {
      return res.status(400).json(
        errorResponse('Driver with this license number already exists', 400)
      );
    }
    
    // Create user with driver role
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: ROLES.DRIVER
    });
    
    // Create driver profile
    const driver = await Driver.create({
      user: user._id,
      licenseNumber,
      licenseExpiry,
      assignedVehicle: assignedVehicle || null,
      status: status || DRIVER_STATUS.AVAILABLE,
      address,
      emergencyContact,
      notes
    });
    
    // If vehicle is assigned, update vehicle's currentDriver
    if (assignedVehicle) {
      await Vehicle.findByIdAndUpdate(assignedVehicle, {
        currentDriver: user._id
      });
    }
    
    // Populate references for response
    const populatedDriver = await Driver.findById(driver._id)
      .populate('user', 'name email phone')
      .populate('assignedVehicle', 'make model licensePlate');
    
    res.status(201).json(
      successResponse('Driver created successfully', { driver: populatedDriver }, 201)
    );
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Update driver by ID
 * @route PUT /api/drivers/:id
 * @access Private (Admin only)
 */
const updateDriver = async (req, res) => {
  try {
    const { 
      name,
      email,
      phone,
      licenseNumber,
      licenseExpiry,
      assignedVehicle,
      status,
      address,
      emergencyContact,
      notes
    } = req.body;
    
    // Check if driver exists
    let driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json(
        errorResponse('Driver not found', 404)
      );
    }
    
    // Check if license number is being changed and already exists
    if (licenseNumber && licenseNumber !== driver.licenseNumber) {
      const existingDriver = await Driver.findOne({ licenseNumber });
      if (existingDriver && existingDriver._id.toString() !== req.params.id) {
        return res.status(400).json(
          errorResponse('Driver with this license number already exists', 400)
        );
      }
    }
    
    // Update user information if provided
    if (name || email || phone) {
      const user = await User.findById(driver.user);
      
      if (!user) {
        return res.status(404).json(
          errorResponse('User not found', 404)
        );
      }
      
      // Check if email is being changed and already exists
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json(
            errorResponse('User with this email already exists', 400)
          );
        }
      }
      
      // Update user
      await User.findByIdAndUpdate(driver.user, {
        name: name || user.name,
        email: email || user.email,
        phone: phone || user.phone
      });
    }
    
    // Handle vehicle assignment changes
    if (assignedVehicle !== undefined) {
      // If driver had a vehicle assigned previously, unassign it
      if (driver.assignedVehicle) {
        await Vehicle.findByIdAndUpdate(driver.assignedVehicle, {
          currentDriver: null
        });
      }
      
      // If a new vehicle is being assigned, update it
      if (assignedVehicle) {
        await Vehicle.findByIdAndUpdate(assignedVehicle, {
          currentDriver: driver.user
        });
      }
    }
    
    // Update driver
    driver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        licenseNumber,
        licenseExpiry,
        assignedVehicle,
        status,
        address,
        emergencyContact,
        notes
      },
      { new: true, runValidators: true }
    )
    .populate('user', 'name email phone')
    .populate('assignedVehicle', 'make model licensePlate');
    
    res.status(200).json(
      successResponse('Driver updated successfully', { driver }, 200)
    );
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Delete driver by ID
 * @route DELETE /api/drivers/:id
 * @access Private (Admin only)
 */
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json(
        errorResponse('Driver not found', 404)
      );
    }
    
    // Check if driver has an assigned vehicle
    if (driver.assignedVehicle) {
      // Unassign vehicle
      await Vehicle.findByIdAndUpdate(driver.assignedVehicle, {
        currentDriver: null
      });
    }
    
    // Delete driver
    await Driver.findByIdAndDelete(req.params.id);
    
    // Delete associated user
    await User.findByIdAndDelete(driver.user);
    
    res.status(200).json(
      successResponse('Driver deleted successfully', null, 200)
    );
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Get driver statistics
 * @route GET /api/drivers/stats
 * @access Private (Admin only)
 */
const getDriverStats = async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await Driver.aggregate([
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
    const totalDrivers = await Driver.countDocuments();
    
    // Get drivers with expiring licenses (within next month)
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    
    const expiringLicenses = await Driver.countDocuments({
      licenseExpiry: { $lt: oneMonthFromNow, $gt: new Date() }
    });
    
    // Get assigned vs unassigned drivers
    const assignedDrivers = await Driver.countDocuments({
      assignedVehicle: { $ne: null }
    });
    
    const stats = {
      total: totalDrivers,
      byStatus: statusStats,
      expiringLicenses,
      assigned: assignedDrivers,
      unassigned: totalDrivers - assignedDrivers
    };
    
    res.status(200).json(
      successResponse('Driver statistics retrieved successfully', { stats }, 200)
    );
  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

module.exports = {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverStats
};
