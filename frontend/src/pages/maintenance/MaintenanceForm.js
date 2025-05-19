/**
 * Maintenance Form Component
 * Form for creating and editing maintenance records with validation
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
  Build as MaintenanceIcon,
  DirectionsCar as VehicleIcon,
  Person as MechanicIcon,
  Schedule as ScheduleIcon,
  AttachMoney as CostIcon
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import maintenanceService from '../../services/maintenanceService';
import vehicleService from '../../services/vehicleService';
import { ROLES } from '../../constants/roles';

// Constants for form options
const MAINTENANCE_TYPES = ['routine', 'repair', 'inspection', 'emergency'];
const MAINTENANCE_STATUS = ['scheduled', 'in_progress', 'completed'];

/**
 * Maintenance Form component for creating and editing maintenance records
 * @returns {JSX.Element} Maintenance Form component
 */
const MaintenanceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const isEditMode = Boolean(id);
  
  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const preSelectedVehicleId = queryParams.get('vehicleId');
  
  // State for form data
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // State for dropdown options
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  
  // Check if user has permission to access this page
  useEffect(() => {
    if (user?.role !== ROLES.ADMIN) {
      navigate('/maintenance');
    }
  }, [user, navigate]);
  
  // Fetch maintenance data if in edit mode
  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch maintenance details
        const response = await maintenanceService.getMaintenanceById(id, token);
        const maintenanceData = response.data.maintenance;
        
        // Set form values
        formik.setValues({
          vehicleId: maintenanceData.vehicle?._id || '',
          maintenanceType: maintenanceData.maintenanceType || 'routine',
          description: maintenanceData.description || '',
          date: maintenanceData.date ? new Date(maintenanceData.date).toISOString().slice(0, 10) : '',
          cost: maintenanceData.cost || '',
          status: maintenanceData.status || 'scheduled',
          mechanic: maintenanceData.mechanic || '',
          odometerAtService: maintenanceData.odometerAtService || ''
        });
      } catch (err) {
        console.error('Error fetching maintenance data:', err);
        setError('Failed to load maintenance data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && isEditMode) {
      fetchMaintenanceData();
    }
  }, [id, token, isEditMode]);
  
  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setVehiclesLoading(true);
        const response = await vehicleService.getVehicles({}, token);
        setVehicles(response.data.vehicles || []);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      } finally {
        setVehiclesLoading(false);
      }
    };
    
    if (token) {
      fetchVehicles();
    }
  }, [token]);
  
  // Set pre-selected vehicle if provided in query params
  useEffect(() => {
    if (!isEditMode && preSelectedVehicleId) {
      formik.setFieldValue('vehicleId', preSelectedVehicleId);
    }
  }, [isEditMode, preSelectedVehicleId, vehicles]);
  
  // Form validation schema
  const validationSchema = Yup.object({
    vehicleId: Yup.string().required('Vehicle is required'),
    maintenanceType: Yup.string().required('Maintenance type is required'),
    description: Yup.string().required('Description is required'),
    date: Yup.date().required('Date is required'),
    cost: Yup.number()
      .typeError('Cost must be a number')
      .min(0, 'Cost must be at least 0')
      .nullable(),
    status: Yup.string().required('Status is required'),
    mechanic: Yup.string(),
    odometerAtService: Yup.number()
      .typeError('Odometer reading must be a number')
      .min(0, 'Odometer reading must be at least 0')
      .nullable()
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      vehicleId: '',
      maintenanceType: 'routine',
      description: '',
      date: new Date().toISOString().slice(0, 10), // Default to today
      cost: '',
      status: 'scheduled',
      mechanic: '',
      odometerAtService: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError(null);
        
        // Convert empty strings to null for numeric fields
        const payload = { ...values };
        ['cost', 'odometerAtService'].forEach(field => {
          if (payload[field] === '') {
            payload[field] = null;
          }
        });
        
        // Create or update maintenance record
        if (isEditMode) {
          await maintenanceService.updateMaintenance(id, payload, token);
        } else {
          await maintenanceService.createMaintenance(payload, token);
        }
        
        // Navigate back to maintenance list
        navigate('/maintenance');
      } catch (err) {
        console.error('Error saving maintenance record:', err);
        setError(`Failed to ${isEditMode ? 'update' : 'create'} maintenance record. Please try again.`);
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
          <IconButton onClick={() => navigate('/maintenance')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Edit Maintenance Record' : 'Schedule New Maintenance'}
          </Typography>
        </Box>
      </Box>
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Maintenance form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <MaintenanceIcon sx={{ mr: 1 }} />
                Maintenance Information
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
                  onChange={formik.handleChange}
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
              <FormControl 
                fullWidth 
                error={formik.touched.maintenanceType && Boolean(formik.errors.maintenanceType)}
              >
                <InputLabel id="maintenanceType-label">Maintenance Type *</InputLabel>
                <Select
                  labelId="maintenanceType-label"
                  id="maintenanceType"
                  name="maintenanceType"
                  value={formik.values.maintenanceType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Maintenance Type *"
                >
                  {MAINTENANCE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.maintenanceType && formik.errors.maintenanceType && (
                  <FormHelperText>{formik.errors.maintenanceType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description *"
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
                id="date"
                name="date"
                label="Maintenance Date *"
                type="date"
                value={formik.values.date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
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
                id="cost"
                name="cost"
                label="Estimated Cost ($)"
                type="number"
                value={formik.values.cost}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cost && Boolean(formik.errors.cost)}
                helperText={formik.touched.cost && formik.errors.cost}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CostIcon />
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
                    {MAINTENANCE_STATUS.map((status) => (
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
            
            {/* Additional Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="mechanic"
                name="mechanic"
                label="Mechanic/Technician"
                value={formik.values.mechanic}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.mechanic && Boolean(formik.errors.mechanic)}
                helperText={formik.touched.mechanic && formik.errors.mechanic}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MechanicIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="odometerAtService"
                name="odometerAtService"
                label="Odometer Reading (km)"
                type="number"
                value={formik.values.odometerAtService}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.odometerAtService && Boolean(formik.errors.odometerAtService)}
                helperText={formik.touched.odometerAtService && formik.errors.odometerAtService}
              />
            </Grid>
            
            {/* Form Actions */}
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/maintenance')}
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
                    {isEditMode ? 'Updating...' : 'Create'}
                  </>
                ) : (
                  isEditMode ? 'Update Maintenance' : 'Schedule Maintenance'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default MaintenanceForm;
