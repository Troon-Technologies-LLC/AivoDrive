/**
 * Vehicle Form Component
 * Form for creating and editing vehicles with validation
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
  IconButton
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  DirectionsCar as CarIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import vehicleService from '../../services/vehicleService';
import driverService from '../../services/driverService';
import notificationService from '../../services/notificationService';
import { ROLES } from '../../constants/roles';

// Constants for form options
const VEHICLE_STATUS = ['active', 'maintenance', 'inactive'];
const FUEL_TYPES = ['gasoline', 'diesel', 'electric', 'hybrid', 'other'];

/**
 * Vehicle Form component for creating and editing vehicles
 * @returns {JSX.Element} Vehicle Form component
 */
const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isEditMode = Boolean(id);
  
  // State for form data
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  
  // Check if user has permission to access this page
  useEffect(() => {
    if (user?.role !== ROLES.ADMIN) {
      navigate('/vehicles');
    }
  }, [user, navigate]);
  
  // Fetch vehicle data if in edit mode
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(true);
        
        // Fetch vehicle details
        const response = await vehicleService.getVehicleById(id, token);
        const vehicleData = response.data.vehicle;
        
        // Set form values
        formik.setValues({
          licensePlate: vehicleData.licensePlate || '',
          make: vehicleData.make || '',
          model: vehicleData.model || '',
          year: vehicleData.year || '',
          vinNumber: vehicleData.vinNumber || '',
          registrationExpiry: vehicleData.registrationExpiry ? new Date(vehicleData.registrationExpiry).toISOString().split('T')[0] : '',
          insuranceExpiry: vehicleData.insuranceExpiry ? new Date(vehicleData.insuranceExpiry).toISOString().split('T')[0] : '',
          status: vehicleData.status || 'active',
          lastServiceDate: vehicleData.lastServiceDate ? new Date(vehicleData.lastServiceDate).toISOString().split('T')[0] : '',
          fuelType: vehicleData.fuelType || 'gasoline',
          fuelCapacity: vehicleData.fuelCapacity || '',
          mileage: vehicleData.mileage || '',
          currentDriver: vehicleData.currentDriver?._id || '',
          notes: vehicleData.notes || ''
        });
      } catch (err) {
        console.error('Error fetching vehicle data:', err);
        notificationService.showError('Failed to load vehicle data', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch available drivers
    const fetchAvailableDrivers = async () => {
      try {
        const response = await driverService.getDrivers({ status: 'available' }, token);
        setAvailableDrivers(response.data.drivers || []);
      } catch (err) {
        console.error('Error fetching available drivers:', err);
      }
    };
    
    if (token) {
      fetchAvailableDrivers();
      
      if (isEditMode) {
        fetchVehicleData();
      }
    }
  }, [id, token, isEditMode]);
  
  // Form validation schema
  const validationSchema = Yup.object({
    licensePlate: Yup.string()
      .required('License plate is required')
      .max(20, 'License plate must be at most 20 characters'),
    make: Yup.string()
      .required('Make is required')
      .max(50, 'Make must be at most 50 characters'),
    model: Yup.string()
      .required('Model is required')
      .max(50, 'Model must be at most 50 characters'),
    year: Yup.number()
      .typeError('Year must be a number')
      .required('Year is required')
      .integer('Year must be an integer')
      .min(1900, 'Year must be at least 1900')
      .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
    vinNumber: Yup.string()
      .max(17, 'VIN must be at most 17 characters'),
    registrationExpiry: Yup.date()
      .nullable(),
    insuranceExpiry: Yup.date()
      .nullable(),
    status: Yup.string()
      .required('Status is required'),
    lastServiceDate: Yup.date().nullable(),
    fuelType: Yup.string(),
    fuelCapacity: Yup.number()
      .typeError('Fuel capacity must be a number')
      .min(0, 'Fuel capacity must be at least 0')
      .nullable(),
    mileage: Yup.number()
      .typeError('Mileage must be a number')
      .min(0, 'Mileage must be at least 0')
      .nullable(),
    currentDriver: Yup.string(),
    notes: Yup.string()
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      licensePlate: '',
      make: '',
      model: '',
      year: '',
      vinNumber: '',
      registrationExpiry: '',
      insuranceExpiry: '',
      status: 'active',
      lastServiceDate: '',
      fuelType: 'gasoline',
      fuelCapacity: '',
      mileage: '',
      currentDriver: '',
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        
        // Convert empty strings to null for numeric fields and ObjectId fields
        const payload = { ...values };
        ['fuelCapacity', 'mileage'].forEach(field => {
          if (payload[field] === '') {
            payload[field] = null;
          }
        });
        // Convert empty string to null for ObjectId fields
        if (payload.currentDriver === '') {
          payload.currentDriver = null;
        }
        
        // Create or update vehicle
        if (isEditMode) {
          await vehicleService.updateVehicle(id, payload, token);
    
        } else {
          await vehicleService.createVehicle(payload, token);
    
        }
        
        // Navigate back to vehicles list
        navigate('/vehicles');
      } catch (err) {
        console.error('Error saving vehicle:', err);
        // The notification service in vehicleService will handle displaying the error
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
          <IconButton onClick={() => navigate('/vehicles')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
          </Typography>
        </Box>
      </Box>
      

      
      {/* Vehicle form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <CarIcon sx={{ mr: 1 }} />
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="licensePlate"
                name="licensePlate"
                label="License Plate *"
                value={formik.values.licensePlate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.licensePlate && Boolean(formik.errors.licensePlate)}
                helperText={formik.touched.licensePlate && formik.errors.licensePlate}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="make"
                name="make"
                label="Make *"
                value={formik.values.make}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.make && Boolean(formik.errors.make)}
                helperText={formik.touched.make && formik.errors.make}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="model"
                name="model"
                label="Model *"
                value={formik.values.model}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.model && Boolean(formik.errors.model)}
                helperText={formik.touched.model && formik.errors.model}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="year"
                name="year"
                label="Year *"
                type="number"
                value={formik.values.year}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.year && Boolean(formik.errors.year)}
                helperText={formik.touched.year && formik.errors.year}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="vinNumber"
                name="vinNumber"
                label="VIN Number"
                value={formik.values.vinNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.vinNumber && Boolean(formik.errors.vinNumber)}
                helperText={formik.touched.vinNumber && formik.errors.vinNumber}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="insuranceExpiry"
                name="insuranceExpiry"
                label="Insurance Expiry Date"
                type="date"
                value={formik.values.insuranceExpiry}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.insuranceExpiry && Boolean(formik.errors.insuranceExpiry)}
                helperText={formik.touched.insuranceExpiry && formik.errors.insuranceExpiry}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            

            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="registrationExpiry"
                name="registrationExpiry"
                label="Registration Expiry Date"
                type="date"
                value={formik.values.registrationExpiry}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.registrationExpiry && Boolean(formik.errors.registrationExpiry)}
                helperText={formik.touched.registrationExpiry && formik.errors.registrationExpiry}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
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
                  {VEHICLE_STATUS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Current Status */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                Current Status
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="mileage"
                name="mileage"
                label="Mileage (km)"
                type="number"
                value={formik.values.mileage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.mileage && Boolean(formik.errors.mileage)}
                helperText={formik.touched.mileage && formik.errors.mileage}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="lastServiceDate"
                name="lastServiceDate"
                label="Last Service Date"
                type="date"
                value={formik.values.lastServiceDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastServiceDate && Boolean(formik.errors.lastServiceDate)}
                helperText={formik.touched.lastServiceDate && formik.errors.lastServiceDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="currentDriver-label">Current Driver</InputLabel>
                <Select
                  labelId="currentDriver-label"
                  id="currentDriver"
                  name="currentDriver"
                  value={formik.values.currentDriver}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Current Driver"
                >
                  <MenuItem value="">None</MenuItem>
                  {availableDrivers.map((driver) => (
                    <MenuItem key={driver._id} value={driver._id}>
                      {driver.name || 'Unknown'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Technical Specifications */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                Technical Specifications
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="fuelType-label">Fuel Type</InputLabel>
                <Select
                  labelId="fuelType-label"
                  id="fuelType"
                  name="fuelType"
                  value={formik.values.fuelType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Fuel Type"
                >
                  <MenuItem value="">Select Fuel Type</MenuItem>
                  {FUEL_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="fuelCapacity"
                name="fuelCapacity"
                label="Fuel Capacity (L)"
                type="number"
                value={formik.values.fuelCapacity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fuelCapacity && Boolean(formik.errors.fuelCapacity)}
                helperText={formik.touched.fuelCapacity && formik.errors.fuelCapacity}
              />
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
                id="notes"
                name="notes"
                label="Notes"
                multiline
                rows={4}
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
                onClick={() => navigate('/vehicles')}
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
                  isEditMode ? 'Update Vehicle' : 'Create Vehicle'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default VehicleForm;
