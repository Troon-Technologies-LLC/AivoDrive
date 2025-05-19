/**
 * Trip Form Component
 * Form for creating and editing trips with validation
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
  Autocomplete,
  InputAdornment
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Map as TripIcon,
  LocationOn as LocationIcon,
  DirectionsCar as VehicleIcon,
  Person as DriverIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import tripService from '../../services/tripService';
import vehicleService from '../../services/vehicleService';
import driverService from '../../services/driverService';
import { ROLES } from '../../constants/roles';

// Constants for form options
const TRIP_STATUS = ['scheduled', 'in_progress', 'completed', 'cancelled'];

/**
 * Trip Form component for creating and editing trips
 * @returns {JSX.Element} Trip Form component
 */
const TripForm = () => {
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
  
  // Check if user has permission to access this page
  useEffect(() => {
    if (user?.role !== ROLES.ADMIN && user?.role !== ROLES.DISPATCHER) {
      navigate('/trips');
    }
  }, [user, navigate]);
  
  // Fetch trip data if in edit mode
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch trip details
        const response = await tripService.getTripById(id, token);
        const tripData = response.data.trip;
        
        // Set form values
        formik.setValues({
          title: tripData.title || '',
          origin: tripData.origin || '',
          destination: tripData.destination || '',
          startTime: tripData.startTime ? new Date(tripData.startTime).toISOString().slice(0, 16) : '',
          endTime: tripData.endTime ? new Date(tripData.endTime).toISOString().slice(0, 16) : '',
          status: tripData.status || 'scheduled',
          vehicleId: tripData.vehicle?._id || '',
          driverId: tripData.driver?._id || '',
          description: tripData.description || '',
          distance: tripData.distance || '',
          estimatedDuration: tripData.estimatedDuration || ''
        });
      } catch (err) {
        console.error('Error fetching trip data:', err);
        setError('Failed to load trip data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && isEditMode) {
      fetchTripData();
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
    if (!isEditMode && preSelectedVehicleId) {
      formik.setFieldValue('vehicleId', preSelectedVehicleId);
    }
    
    if (!isEditMode && preSelectedDriverId) {
      formik.setFieldValue('driverId', preSelectedDriverId);
    }
  }, [isEditMode, preSelectedVehicleId, preSelectedDriverId, vehicles, drivers]);
  
  // Form validation schema
  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    origin: Yup.string().required('Origin is required'),
    destination: Yup.string().required('Destination is required'),
    startTime: Yup.date().required('Start time is required'),
    endTime: Yup.date()
      .min(
        Yup.ref('startTime'),
        'End time must be after start time'
      )
      .required('End time is required'),
    status: Yup.string().required('Status is required'),
    vehicleId: Yup.string().required('Vehicle is required'),
    driverId: Yup.string().required('Driver is required'),
    description: Yup.string(),
    distance: Yup.number()
      .typeError('Distance must be a number')
      .min(0, 'Distance must be at least 0')
      .nullable(),
    estimatedDuration: Yup.number()
      .typeError('Estimated duration must be a number')
      .min(0, 'Estimated duration must be at least 0')
      .nullable()
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      title: '',
      origin: '',
      destination: '',
      startTime: '',
      endTime: '',
      status: 'scheduled',
      vehicleId: '',
      driverId: '',
      description: '',
      distance: '',
      estimatedDuration: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError(null);
        
        // Convert empty strings to null for numeric fields
        const payload = { ...values };
        ['distance', 'estimatedDuration'].forEach(field => {
          if (payload[field] === '') {
            payload[field] = null;
          }
        });
        
        // Create or update trip
        if (isEditMode) {
          await tripService.updateTrip(id, payload, token);
        } else {
          await tripService.createTrip(payload, token);
        }
        
        // Navigate back to trips list
        navigate('/trips');
      } catch (err) {
        console.error('Error saving trip:', err);
        setError(`Failed to ${isEditMode ? 'update' : 'create'} trip. Please try again.`);
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
          <IconButton onClick={() => navigate('/trips')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Edit Trip' : 'Create New Trip'}
          </Typography>
        </Box>
      </Box>
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Trip form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <TripIcon sx={{ mr: 1 }} />
                Trip Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Trip Title *"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="origin"
                name="origin"
                label="Origin *"
                value={formik.values.origin}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.origin && Boolean(formik.errors.origin)}
                helperText={formik.touched.origin && formik.errors.origin}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="destination"
                name="destination"
                label="Destination *"
                value={formik.values.destination}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.destination && Boolean(formik.errors.destination)}
                helperText={formik.touched.destination && formik.errors.destination}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="startTime"
                name="startTime"
                label="Start Time *"
                type="datetime-local"
                value={formik.values.startTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.startTime && Boolean(formik.errors.startTime)}
                helperText={formik.touched.startTime && formik.errors.startTime}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="endTime"
                name="endTime"
                label="End Time *"
                type="datetime-local"
                value={formik.values.endTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.endTime && Boolean(formik.errors.endTime)}
                helperText={formik.touched.endTime && formik.errors.endTime}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {isEditMode && (
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <InputLabel id="status-label">Status *</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Status *"
                  >
                    {TRIP_STATUS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <FormHelperText>{formik.errors.status}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
            
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
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Vehicle *"
                  startAdornment={
                    <InputAdornment position="start">
                      <VehicleIcon />
                    </InputAdornment>
                  }
                  disabled={vehiclesLoading}
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
              <FormControl 
                fullWidth 
                error={formik.touched.driverId && Boolean(formik.errors.driverId)}
              >
                <InputLabel id="driverId-label">Driver *</InputLabel>
                <Select
                  labelId="driverId-label"
                  id="driverId"
                  name="driverId"
                  value={formik.values.driverId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Driver *"
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
                      <MenuItem value="">Select a driver</MenuItem>
                      {drivers.map((driver) => (
                        <MenuItem key={driver._id} value={driver._id}>
                          {driver.name || `${driver.firstName} ${driver.lastName}`}
                        </MenuItem>
                      ))}
                    </>
                  )}
                </Select>
                {formik.touched.driverId && formik.errors.driverId && (
                  <FormHelperText>{formik.errors.driverId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Additional Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="distance"
                name="distance"
                label="Distance (km)"
                type="number"
                value={formik.values.distance}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.distance && Boolean(formik.errors.distance)}
                helperText={formik.touched.distance && formik.errors.distance}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="estimatedDuration"
                name="estimatedDuration"
                label="Estimated Duration (minutes)"
                type="number"
                value={formik.values.estimatedDuration}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.estimatedDuration && Boolean(formik.errors.estimatedDuration)}
                helperText={formik.touched.estimatedDuration && formik.errors.estimatedDuration}
              />
            </Grid>
            
            {/* Form Actions */}
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/trips')}
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
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Trip' : 'Create Trip'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TripForm;
