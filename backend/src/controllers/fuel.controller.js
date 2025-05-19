/**
 * Fuel Controller
 * Handles API requests related to fuel management
 */

const Fuel = require('../models/fuel.model');
const Vehicle = require('../models/vehicle.model');
const { validationResult } = require('express-validator');

/**
 * Get all fuel records with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with fuel records
 */
exports.getFuelRecords = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'date', 
      sortOrder = 'desc',
      search = '',
      vehicleId = '',
      startDate = '',
      endDate = ''
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { 'vehicle.licensePlate': { $regex: search, $options: 'i' } },
        { 'vehicle.make': { $regex: search, $options: 'i' } },
        { 'vehicle.model': { $regex: search, $options: 'i' } },
        { fuelStation: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (vehicleId) {
      filter.vehicle = vehicleId;
    }
    
    // Date range filter
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      filter.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.date = { $lte: new Date(endDate) };
    }
    
    // Set up sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const fuelRecords = await Fuel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('vehicle', 'make model licensePlate')
      .populate('driver', 'firstName lastName name')
      .populate('createdBy', 'name');
    
    // Get total count for pagination
    const totalCount = await Fuel.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      fuelRecords,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / parseInt(limit))
    });
  } catch (error) {
    console.error('Error getting fuel records:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get fuel record by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with fuel record
 */
exports.getFuelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const fuelRecord = await Fuel.findById(id)
      .populate('vehicle', 'make model licensePlate fuelType fuelCapacity odometer')
      .populate('driver', 'firstName lastName name')
      .populate('createdBy', 'name');
    
    if (!fuelRecord) {
      return res.status(404).json({
        success: false,
        message: 'Fuel record not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      fuelRecord
    });
  } catch (error) {
    console.error('Error getting fuel record:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Create a new fuel record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created fuel record
 */
exports.createFuel = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { 
      vehicleId,
      driverId,
      date,
      fuelAmount,
      fuelPrice,
      totalCost,
      odometer,
      previousOdometer,
      fuelStation,
      notes
    } = req.body;
    
    // Create new fuel record
    const newFuelRecord = new Fuel({
      vehicle: vehicleId,
      driver: driverId || null,
      date,
      fuelAmount,
      fuelPrice,
      totalCost,
      odometer,
      previousOdometer,
      fuelStation,
      notes,
      createdBy: req.user.id
    });
    
    // Save fuel record
    const savedFuelRecord = await newFuelRecord.save();
    
    // Update vehicle's odometer if provided
    if (odometer) {
      await Vehicle.findByIdAndUpdate(vehicleId, { odometer });
    }
    
    return res.status(201).json({
      success: true,
      fuelRecord: savedFuelRecord,
      message: 'Fuel record created successfully'
    });
  } catch (error) {
    console.error('Error creating fuel record:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update a fuel record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated fuel record
 */
exports.updateFuel = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { 
      date,
      fuelAmount,
      fuelPrice,
      totalCost,
      odometer,
      previousOdometer,
      fuelStation,
      notes
    } = req.body;
    
    // Find fuel record
    const fuelRecord = await Fuel.findById(id);
    
    if (!fuelRecord) {
      return res.status(404).json({
        success: false,
        message: 'Fuel record not found'
      });
    }
    
    // Update fuel record fields
    fuelRecord.date = date || fuelRecord.date;
    fuelRecord.fuelAmount = fuelAmount || fuelRecord.fuelAmount;
    fuelRecord.fuelPrice = fuelPrice || fuelRecord.fuelPrice;
    fuelRecord.totalCost = totalCost || fuelRecord.totalCost;
    fuelRecord.odometer = odometer || fuelRecord.odometer;
    fuelRecord.previousOdometer = previousOdometer || fuelRecord.previousOdometer;
    fuelRecord.fuelStation = fuelStation || fuelRecord.fuelStation;
    fuelRecord.notes = notes || fuelRecord.notes;
    
    // Save updated fuel record
    const updatedFuelRecord = await fuelRecord.save();
    
    // Update vehicle's odometer if provided
    if (odometer) {
      await Vehicle.findByIdAndUpdate(fuelRecord.vehicle, { odometer });
    }
    
    return res.status(200).json({
      success: true,
      fuelRecord: updatedFuelRecord,
      message: 'Fuel record updated successfully'
    });
  } catch (error) {
    console.error('Error updating fuel record:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Delete a fuel record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with deletion status
 */
exports.deleteFuel = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and delete fuel record
    const fuelRecord = await Fuel.findByIdAndDelete(id);
    
    if (!fuelRecord) {
      return res.status(404).json({
        success: false,
        message: 'Fuel record not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Fuel record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting fuel record:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get fuel statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with fuel statistics
 */
exports.getFuelStats = async (req, res) => {
  try {
    // Get total records count
    const totalRecords = await Fuel.countDocuments();
    
    // Get total fuel cost
    const totalCostResult = await Fuel.aggregate([
      {
        $group: {
          _id: null,
          totalFuelCost: { $sum: '$totalCost' },
          totalFuelAmount: { $sum: '$fuelAmount' }
        }
      }
    ]);
    
    const totalFuelCost = totalCostResult.length > 0 ? totalCostResult[0].totalFuelCost : 0;
    const totalFuelAmount = totalCostResult.length > 0 ? totalCostResult[0].totalFuelAmount : 0;
    
    // Calculate average fuel price
    const averageFuelPrice = totalFuelAmount > 0 ? totalFuelCost / totalFuelAmount : 0;
    
    // Calculate average fuel efficiency
    const efficiencyResult = await Fuel.aggregate([
      {
        $match: {
          odometer: { $exists: true, $ne: null },
          previousOdometer: { $exists: true, $ne: null }
        }
      },
      {
        $project: {
          distance: { $subtract: ['$odometer', '$previousOdometer'] },
          fuelAmount: '$fuelAmount'
        }
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distance' },
          totalFuel: { $sum: '$fuelAmount' }
        }
      }
    ]);
    
    const averageFuelEfficiency = efficiencyResult.length > 0 && efficiencyResult[0].totalFuel > 0
      ? efficiencyResult[0].totalDistance / efficiencyResult[0].totalFuel
      : 0;
    
    return res.status(200).json({
      success: true,
      stats: {
        totalRecords,
        totalFuelCost,
        totalFuelAmount,
        averageFuelPrice,
        averageFuelEfficiency
      }
    });
  } catch (error) {
    console.error('Error getting fuel statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get fuel records for a specific vehicle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with vehicle's fuel records
 */
exports.getVehicleFuelRecords = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { limit = 10 } = req.query;
    
    // Find fuel records for the vehicle
    const fuelRecords = await Fuel.find({ vehicle: vehicleId })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('driver', 'firstName lastName name')
      .populate('createdBy', 'name');
    
    // Get total count
    const totalCount = await Fuel.countDocuments({ vehicle: vehicleId });
    
    return res.status(200).json({
      success: true,
      fuelRecords,
      totalCount
    });
  } catch (error) {
    console.error('Error getting vehicle fuel records:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get fuel efficiency report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with fuel efficiency report
 */
exports.getFuelEfficiencyReport = async (req, res) => {
  try {
    const { startDate, endDate, vehicleId } = req.query;
    
    // Build filter object
    const filter = {
      odometer: { $exists: true, $ne: null },
      previousOdometer: { $exists: true, $ne: null }
    };
    
    if (vehicleId) {
      filter.vehicle = vehicleId;
    }
    
    // Date range filter
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      filter.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.date = { $lte: new Date(endDate) };
    }
    
    // Aggregate fuel efficiency by vehicle
    const efficiencyByVehicle = await Fuel.aggregate([
      { $match: filter },
      {
        $project: {
          vehicle: 1,
          date: 1,
          distance: { $subtract: ['$odometer', '$previousOdometer'] },
          fuelAmount: 1,
          totalCost: 1
        }
      },
      {
        $group: {
          _id: '$vehicle',
          totalDistance: { $sum: '$distance' },
          totalFuel: { $sum: '$fuelAmount' },
          totalCost: { $sum: '$totalCost' },
          records: { $sum: 1 },
          avgDistance: { $avg: '$distance' }
        }
      },
      {
        $project: {
          totalDistance: 1,
          totalFuel: 1,
          totalCost: 1,
          records: 1,
          avgDistance: 1,
          efficiency: { $divide: ['$totalDistance', '$totalFuel'] },
          costPerKm: { $divide: ['$totalCost', '$totalDistance'] }
        }
      },
      { $sort: { efficiency: -1 } }
    ]);
    
    // Populate vehicle details
    const report = await Vehicle.populate(efficiencyByVehicle, {
      path: '_id',
      select: 'make model licensePlate year fuelType',
      model: 'Vehicle'
    });
    
    // Format report data
    const formattedReport = report.map(item => ({
      vehicle: item._id,
      totalDistance: item.totalDistance,
      totalFuel: item.totalFuel,
      totalCost: item.totalCost,
      records: item.records,
      avgDistance: item.avgDistance,
      efficiency: item.efficiency,
      costPerKm: item.costPerKm
    }));
    
    return res.status(200).json({
      success: true,
      report: formattedReport
    });
  } catch (error) {
    console.error('Error generating fuel efficiency report:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
