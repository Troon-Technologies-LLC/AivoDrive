/**
 * Maintenance Controller
 * Handles CRUD operations for vehicle maintenance scheduling and tracking
 */

const { Maintenance, MAINTENANCE_STATUS } = require('../models/maintenance.model');
const { Vehicle, VEHICLE_STATUS } = require('../models/vehicle.model');
const { ROLES } = require('../models/user.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

/**
 * Get all maintenance records with pagination
 * @route GET /api/maintenance
 * @access Private (Admin only)
 */
const getMaintenanceRecords = async (req, res) => {
  try {
    // Only Admin can access maintenance records
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to access maintenance records', 403)
      );
    }
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';
    
    // Build query
    const query = {};
    
    // Add status filter if provided
    if (status && Object.values(MAINTENANCE_STATUS).includes(status)) {
      query.status = status;
    }
    
    // Add date range filter if provided
    if (startDate) {
      query.dateScheduled = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      if (!query.dateScheduled) query.dateScheduled = {};
      query.dateScheduled.$lte = new Date(endDate);
    }
    
    // Execute query with pagination
    const maintenanceRecords = await Maintenance.find(query)
      .populate('vehicleId', 'make model licensePlate year')
      .populate('createdBy', 'name email')
      .sort({ dateScheduled: 1 })
      .skip(skip)
      .limit(limit);
    
    // Filter by search term if provided
    let filteredRecords = maintenanceRecords;
    if (search) {
      filteredRecords = maintenanceRecords.filter(record => 
        (record.description && record.description.toLowerCase().includes(search.toLowerCase())) ||
        (record.vehicleId && record.vehicleId.licensePlate && record.vehicleId.licensePlate.toLowerCase().includes(search.toLowerCase())) ||
        (record.vehicleId && record.vehicleId.make && record.vehicleId.make.toLowerCase().includes(search.toLowerCase())) ||
        (record.vehicleId && record.vehicleId.model && record.vehicleId.model.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Get total count for pagination
    const total = search ? filteredRecords.length : await Maintenance.countDocuments(query);
    
    res.status(200).json(
      paginatedResponse(filteredRecords, page, limit, total, 'Maintenance records retrieved successfully')
    );
  } catch (error) {
    console.error('Get maintenance records error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Get maintenance record by ID
 * @route GET /api/maintenance/:id
 * @access Private (Admin only)
 */
const getMaintenanceById = async (req, res) => {
  try {
    // Only Admin can access maintenance records
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to access maintenance records', 403)
      );
    }
    
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('vehicleId', 'make model licensePlate year')
      .populate('createdBy', 'name email');
    
    if (!maintenance) {
      return res.status(404).json(
        errorResponse('Maintenance record not found', 404)
      );
    }
    
    res.status(200).json(
      successResponse('Maintenance record retrieved successfully', { maintenance }, 200)
    );
  } catch (error) {
    console.error('Get maintenance by ID error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Create new maintenance record
 * @route POST /api/maintenance
 * @access Private (Admin only)
 */
const createMaintenance = async (req, res) => {
  try {
    // Only Admin can create maintenance records
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to create maintenance records', 403)
      );
    }
    
    const { 
      vehicleId, 
      dateScheduled, 
      dateCompleted, 
      description, 
      status,
      maintenanceType,
      cost,
      serviceProvider,
      notes
    } = req.body;
    
    // Validate required fields
    if (!vehicleId || !dateScheduled || !description) {
      return res.status(400).json(
        errorResponse('Please provide all required fields', 400)
      );
    }
    
    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json(
        errorResponse('Vehicle not found', 404)
      );
    }
    
    // Create maintenance record
    const maintenance = await Maintenance.create({
      vehicleId,
      dateScheduled,
      dateCompleted: dateCompleted || null,
      description,
      status: status || MAINTENANCE_STATUS.SCHEDULED,
      maintenanceType: maintenanceType || 'routine',
      cost: cost || 0,
      serviceProvider,
      notes,
      createdBy: req.user._id
    });
    
    // If maintenance is in progress, update vehicle status
    if (status === MAINTENANCE_STATUS.IN_PROGRESS) {
      await Vehicle.findByIdAndUpdate(vehicleId, { status: VEHICLE_STATUS.MAINTENANCE });
    }
    
    // If maintenance is completed, update vehicle's lastServiceDate
    if (status === MAINTENANCE_STATUS.COMPLETED) {
      await Vehicle.findByIdAndUpdate(vehicleId, { 
        lastServiceDate: dateCompleted || new Date(),
        status: VEHICLE_STATUS.ACTIVE
      });
    }
    
    // Populate references for response
    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('vehicleId', 'make model licensePlate year')
      .populate('createdBy', 'name email');
    
    res.status(201).json(
      successResponse('Maintenance record created successfully', { maintenance: populatedMaintenance }, 201)
    );
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Update maintenance record by ID
 * @route PUT /api/maintenance/:id
 * @access Private (Admin only)
 */
const updateMaintenance = async (req, res) => {
  try {
    // Only Admin can update maintenance records
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to update maintenance records', 403)
      );
    }
    
    const { 
      vehicleId, 
      dateScheduled, 
      dateCompleted, 
      description, 
      status,
      maintenanceType,
      cost,
      serviceProvider,
      notes
    } = req.body;
    
    // Check if maintenance record exists
    let maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
      return res.status(404).json(
        errorResponse('Maintenance record not found', 404)
      );
    }
    
    // Check if vehicle is being changed and exists
    if (vehicleId && vehicleId !== maintenance.vehicleId.toString()) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json(
          errorResponse('Vehicle not found', 404)
        );
      }
    }
    
    // Handle status change
    if (status && status !== maintenance.status) {
      // If changing to IN_PROGRESS, update vehicle status
      if (status === MAINTENANCE_STATUS.IN_PROGRESS) {
        await Vehicle.findByIdAndUpdate(vehicleId || maintenance.vehicleId, { 
          status: VEHICLE_STATUS.MAINTENANCE 
        });
      }
      
      // If changing to COMPLETED, update vehicle's lastServiceDate and status
      if (status === MAINTENANCE_STATUS.COMPLETED) {
        await Vehicle.findByIdAndUpdate(vehicleId || maintenance.vehicleId, { 
          lastServiceDate: dateCompleted || new Date(),
          status: VEHICLE_STATUS.ACTIVE
        });
      }
      
      // If changing from IN_PROGRESS to something else (not COMPLETED), reset vehicle status
      if (maintenance.status === MAINTENANCE_STATUS.IN_PROGRESS && 
          status !== MAINTENANCE_STATUS.COMPLETED) {
        await Vehicle.findByIdAndUpdate(vehicleId || maintenance.vehicleId, { 
          status: VEHICLE_STATUS.ACTIVE 
        });
      }
    }
    
    // Update maintenance record
    maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      {
        vehicleId,
        dateScheduled,
        dateCompleted,
        description,
        status,
        maintenanceType,
        cost,
        serviceProvider,
        notes
      },
      { new: true, runValidators: true }
    )
    .populate('vehicleId', 'make model licensePlate year')
    .populate('createdBy', 'name email');
    
    res.status(200).json(
      successResponse('Maintenance record updated successfully', { maintenance }, 200)
    );
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Delete maintenance record by ID
 * @route DELETE /api/maintenance/:id
 * @access Private (Admin only)
 */
const deleteMaintenance = async (req, res) => {
  try {
    // Only Admin can delete maintenance records
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to delete maintenance records', 403)
      );
    }
    
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json(
        errorResponse('Maintenance record not found', 404)
      );
    }
    
    // If maintenance was in progress, reset vehicle status
    if (maintenance.status === MAINTENANCE_STATUS.IN_PROGRESS) {
      await Vehicle.findByIdAndUpdate(maintenance.vehicleId, { 
        status: VEHICLE_STATUS.ACTIVE 
      });
    }
    
    await Maintenance.findByIdAndDelete(req.params.id);
    
    res.status(200).json(
      successResponse('Maintenance record deleted successfully', null, 200)
    );
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Get maintenance statistics
 * @route GET /api/maintenance/stats
 * @access Private (Admin only)
 */
const getMaintenanceStats = async (req, res) => {
  try {
    // Only Admin can view maintenance stats
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to view maintenance statistics', 403)
      );
    }
    
    // Get counts by status
    const statusCounts = await Maintenance.aggregate([
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
    const totalMaintenance = await Maintenance.countDocuments();
    
    // Get maintenance scheduled for this week
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    
    const thisWeekMaintenance = await Maintenance.countDocuments({
      dateScheduled: { $gte: today, $lte: endOfWeek },
      status: { $in: [MAINTENANCE_STATUS.SCHEDULED, MAINTENANCE_STATUS.IN_PROGRESS] }
    });
    
    // Get overdue maintenance
    const overdueMaintenance = await Maintenance.countDocuments({
      dateScheduled: { $lt: today },
      status: MAINTENANCE_STATUS.SCHEDULED
    });
    
    // Get maintenance by type
    const maintenanceByType = await Maintenance.aggregate([
      {
        $group: {
          _id: '$maintenanceType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format maintenance by type
    const typeStats = {};
    maintenanceByType.forEach(stat => {
      typeStats[stat._id] = stat.count;
    });
    
    // Get total cost
    const costStats = await Maintenance.aggregate([
      {
        $match: { status: MAINTENANCE_STATUS.COMPLETED }
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' },
          avgCost: { $avg: '$cost' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const stats = {
      total: totalMaintenance,
      byStatus: statusStats,
      byType: typeStats,
      thisWeek: thisWeekMaintenance,
      overdue: overdueMaintenance,
      cost: costStats.length > 0 ? {
        total: costStats[0].totalCost,
        average: costStats[0].avgCost,
        completedMaintenance: costStats[0].count
      } : {
        total: 0,
        average: 0,
        completedMaintenance: 0
      }
    };
    
    res.status(200).json(
      successResponse('Maintenance statistics retrieved successfully', { stats }, 200)
    );
  } catch (error) {
    console.error('Get maintenance stats error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

module.exports = {
  getMaintenanceRecords,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceStats
};
