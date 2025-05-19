/**
 * Fuel Form Component
 * Form for creating and editing fuel records with validation
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  FormHelperText,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  LocalGasStation as FuelIcon,
  DirectionsCar as VehicleIcon,
  Person as DriverIcon,
  Schedule as DateIcon,
  LocationOn as LocationIcon,
  AttachMoney as CostIcon,
  Speed as OdometerIcon
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import fuelService from '../../services/fuelService';
import vehicleService from '../../services/vehicleService';
import driverService from '../../services/driverService';
import { ROLES } from '../../constants/roles';

/**
 * Fuel Form component for creating and editing fuel records
 * @returns {JSX.Element} Fuel Form component
 */
const FuelForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const isEditMode = Boolean(id);
  
  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const preSelectedVehicleId = queryParams.get('vehicleId');
  const preSelectedDriverId = queryParams.get('driverId');
  
  // State for form data
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // State for dropdown options
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [driversLoading, setDriversLoading] = useState(true);
  
  // State for vehicle odometer
  const [selectedVehicleOdometer, setSelectedVehicleOdometer] = useState(null);
  const [previousFuelRecord, setPreviousFuelRecord] = useState(null);
  
  // Check if user has permission to access this page
  useEffect(() => {
    if (user?.role !== ROLES.ADMIN && user?.role !== ROLES.DISPATCHER) {
      navigate('/fuel');
    }
  }, [user, navigate]);
  
  // Fetch fuel data if in edit mode
  useEffect(() => {
    const fetchFuelData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch fuel details
        const response = await fuelService.getFuelById(id, token);
        const fuelData = response.data.fuelRecord;
        
        // Set form values
        formik.setValues({
          vehicleId: fuelData.vehicle?._id || '',
          driverId: fuelData.driver?._id || '',
          date: fuelData.date ? new Date(fuelData.date).toISOString().slice(0, 16) : '',
          fuelAmount: fuelData.fuelAmount || '',
          fuelPrice: fuelData.fuelPrice || '',
          totalCost: fuelData.totalCost || '',
          odometer: fuelData.odometer || '',
          fuelStation: fuelData.fuelStation || '',
          notes: fuelData.notes || ''
        });
        
        // If vehicle is selected, fetch its current odometer
        if (fuelData.vehicle?._id) {
          fetchVehicleOdometer(fuelData.vehicle._id);
        }
      } catch (err) {
        console.error('Error fetching fuel data:', err);
        setError('Failed to load fuel data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && isEditMode) {
      fetchFuelData();
    }
  }, [id, token, isEditMode]);
  
  // Fetch vehicles and drivers
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setVehiclesLoading(true);
        const response = await vehicleService.getVehicles({ status: 'active' }, token);
        setVehicles(response.data.vehicles || []);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      } finally {
        setVehiclesLoading(false);
      }
    };
    
    const fetchDrivers = async () => {
      try {
        setDriversLoading(true);
        const response = await driverService.getDrivers({ status: 'available' }, token);
        setDrivers(response.data.drivers || []);
      } catch (err) {
        console.error('Error fetching drivers:', err);
      } finally {
        setDriversLoading(false);
      }
    };
    
    if (token) {
      fetchVehicles();
      fetchDrivers();
    }
  }, [token]);
  
  // Set pre-selected vehicle and driver if provided in query params
  useEffect(() => {
    if (!isEditMode) {
      if (preSelectedVehicleId) {
        formik.setFieldValue('vehicleId', preSelectedVehicleId);
        fetchVehicleOdometer(preSelectedVehicleId);
      }
      
      if (preSelectedDriverId) {
        formik.setFieldValue('driverId', preSelectedDriverId);
      }
    }
  }, [isEditMode, preSelectedVehicleId, preSelectedDriverId, vehicles, drivers]);
  
  /**
   * Fetch vehicle odometer and previous fuel record
   * @param {String} vehicleId - Vehicle ID
   */
  const fetchVehicleOdometer = async (vehicleId) => {
    try {
      // Fetch vehicle details to get current odometer
      const vehicleResponse = await vehicleService.getVehicleById(vehicleId, token);
      const vehicle = vehicleResponse.data.vehicle;
      setSelectedVehicleOdometer(vehicle.odometer);
      
      // Fetch previous fuel record for this vehicle
      const fuelResponse = await fuelService.getFuelRecords({
        vehicleId,
        limit: 1,
        sortBy: 'date',
        sortOrder: 'desc'
      }, token);
      
      const previousRecords = fuelResponse.data.fuelRecords || [];
      if (previousRecords.length > 0 && previousRecords[0]._id !== id) {
        setPreviousFuelRecord(previousRecords[0]);
      } else {
        setPreviousFuelRecord(null);
      }
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
    }
  };
  
  /**
   * Handle vehicle change
   * @param {Object} event - Event object
   */
  const handleVehicleChange = (event) => {
    const vehicleId = event.target.value;
    formik.setFieldValue('vehicleId', vehicleId);
    
    if (vehicleId) {
      fetchVehicleOdometer(vehicleId);
    } else {
      setSelectedVehicleOdometer(null);
      setPreviousFuelRecord(null);
    }
  };
  
  /**
   * Calculate total cost based on fuel amount and price
   */
  const calculateTotalCost = () => {
    const { fuelAmount, fuelPrice } = formik.values;
    if (fuelAmount && fuelPrice) {
      const totalCost = parseFloat(fuelAmount) * parseFloat(fuelPrice);
      formik.setFieldValue('totalCost', totalCost.toFixed(2));
    }
  };
  
  /**
   * Handle fuel amount change
   * @param {Object} event - Event object
   */
  const handleFuelAmountChange = (event) => {
    formik.setFieldValue('fuelAmount', event.target.value);
    calculateTotalCost();
  };
  
  /**
   * Handle fuel price change
   * @param {Object} event - Event object
   */
  const handleFuelPriceChange = (event) => {
    formik.setFieldValue('fuelPrice', event.target.value);
    calculateTotalCost();
  };
  
  // Form validation schema
  const validationSchema = Yup.object({
    vehicleId: Yup.string().required('Vehicle is required'),
    date: Yup.date().required('Date is required'),
    fuelAmount: Yup.number()
      .typeError('Fuel amount must be a number')
      .positive('Fuel amount must be positive')
      .required('Fuel amount is required'),
    fuelPrice: Yup.number()
      .typeError('Fuel price must be a number')
      .positive('Fuel price must be positive')
      .required('Fuel price is required'),
    totalCost: Yup.number()
      .typeError('Total cost must be a number')
      .positive('Total cost must be positive')
      .required('Total cost is required'),
    odometer: Yup.number()
      .typeError('Odometer reading must be a number')
      .min(0, 'Odometer reading must be at least 0')
      .test(
        'is-greater-than-previous',
        'Odometer reading must be greater than the previous reading',
        function(value) {
          if (!value) return true;
          if (previousFuelRecord && previousFuelRecord.odometer) {
            return value > previousFuelRecord.odometer;
          }
          return true;
        }
      )
      .nullable(),
    fuelStation: Yup.string(),
    notes: Yup.string()
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      vehicleId: '',
      driverId: '',
      date: new Date().toISOString().slice(0, 16), // Default to current date and time
      fuelAmount: '',
      fuelPrice: '',
      totalCost: '',
      odometer: '',
      fuelStation: '',
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError(null);
        
        // Convert empty strings to null for numeric fields
        const payload = { ...values };
        ['odometer'].forEach(field => {
          if (payload[field] === '') {
            payload[field] = null;
          }
        });
        
        // Add previous odometer if available
        if (previousFuelRecord && previousFuelRecord.odometer) {
          payload.previousOdometer = previousFuelRecord.odometer;
        }
        
        // Create or update fuel record
        if (isEditMode) {
          await fuelService.updateFuel(id, payload, token);
        } else {
          await fuelService.createFuel(payload, token);
        }
        
        // Navigate back to fuel list
        navigate('/fuel');
      } catch (err) {
        console.error('Error saving fuel record:', err);
        setError(`Failed to ${isEditMode ? 'update' : 'create'} fuel record. Please try again.`);
      } finally {
        setSubmitting(false);
      }
    }
  });
  
  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/fuel')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Edit Fuel Record' : 'Add New Fuel Record'}
          </Typography>
        </Box>
      </Box>
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Fuel form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <FuelIcon sx={{ mr: 1 }} />
                Fuel Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.vehicleId && Boolean(formik.errors.vehicleId)}
              >
                <InputLabel id="vehicleId-label">Vehicle *</InputLabel>
                <Select
                  labelId="vehicleId-label"
                  id="vehicleId"
                  name="vehicleId"
                  value={formik.values.vehicleId}
                  onChange={handleVehicleChange}
                  onBlur={formik.handleBlur}
                  label="Vehicle *"
                  startAdornment={
                    <InputAdornment position="start">
                      <VehicleIcon />
                    </InputAdornment>
                  }
                  disabled={vehiclesLoading || isEditMode} // Disable vehicle selection in edit mode
                >
                  {vehiclesLoading ? (
                    <MenuItem value="">
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading vehicles...
                    </MenuItem>
                  ) : (
                    <>
                      <MenuItem value="">Select a vehicle</MenuItem>
                      {vehicles.map((vehicle) => (
                        <MenuItem key={vehicle._id} value={vehicle._id}>
                          {`${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`}
                        </MenuItem>
                      ))}
                    </>
                  )}
                </Select>
                {formik.touched.vehicleId && formik.errors.vehicleId && (
                  <FormHelperText>{formik.errors.vehicleId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="driverId-label">Driver</InputLabel>
                <Select
                  labelId="driverId-label"
                  id="driverId"
                  name="driverId"
                  value={formik.values.driverId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Driver"
                  startAdornment={
                    <InputAdornment position="start">
                      <DriverIcon />
                    </InputAdornment>
                  }
                  disabled={driversLoading}
                >
                  {driversLoading ? (
                    <MenuItem value="">
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading drivers...
                    </MenuItem>
                  ) : (
                    <>
                      <MenuItem value="">Select a driver (optional)</MenuItem>
                      {drivers.map((driver) => (
                        <MenuItem key={driver._id} value={driver._id}>
                          {driver.name || `${driver.firstName} ${driver.lastName}`}
                        </MenuItem>
                      ))}
                    </>
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="date"
                name="date"
                label="Date and Time *"
                type="datetime-local"
                value={formik.values.date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="fuelStation"
                name="fuelStation"
                label="Fuel Station"
                value={formik.values.fuelStation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fuelStation && Boolean(formik.errors.fuelStation)}
                helperText={formik.touched.fuelStation && formik.errors.fuelStation}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="fuelAmount"
                name="fuelAmount"
                label="Fuel Amount (L) *"
                type="number"
                value={formik.values.fuelAmount}
                onChange={handleFuelAmountChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fuelAmount && Boolean(formik.errors.fuelAmount)}
                helperText={formik.touched.fuelAmount && formik.errors.fuelAmount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuelIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="fuelPrice"
                name="fuelPrice"
                label="Price per Liter ($) *"
                type="number"
                value={formik.values.fuelPrice}
                onChange={handleFuelPriceChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fuelPrice && Boolean(formik.errors.fuelPrice)}
                helperText={formik.touched.fuelPrice && formik.errors.fuelPrice}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CostIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="totalCost"
                name="totalCost"
                label="Total Cost ($) *"
                type="number"
                value={formik.values.totalCost}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.totalCost && Boolean(formik.errors.totalCost)}
                helperText={formik.touched.totalCost && formik.errors.totalCost}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CostIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="odometer"
                name="odometer"
                label="Odometer Reading (km)"
                type="number"
                value={formik.values.odometer}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.odometer && Boolean(formik.errors.odometer)}
                helperText={formik.touched.odometer && formik.errors.odometer}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <OdometerIcon />
                    </InputAdornment>
                  ),
                }}
              />
              {selectedVehicleOdometer && (
                <Typography variant="caption" color="text.secondary">
                  Current vehicle odometer: {selectedVehicleOdometer} km
                </Typography>
              )}
              {previousFuelRecord && previousFuelRecord.odometer && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Previous fuel record odometer: {previousFuelRecord.odometer} km
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Notes"
                multiline
                rows={3}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
              />
            </Grid>
            
            {/* Form Actions */}
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/fuel')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    {isEditMode ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  isEditMode ? 'Update Fuel Record' : 'Save Fuel Record'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default FuelForm;
