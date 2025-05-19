/**
 * Driver Form Component
 * Form for creating and editing drivers with validation
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
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import driverService from '../../services/driverService';
import vehicleService from '../../services/vehicleService';
import { ROLES } from '../../constants/roles';

// Constants for form options
const DRIVER_STATUS = ['available', 'on_trip', 'off_duty', 'inactive'];
const LICENSE_TYPES = ['A', 'B', 'C', 'D', 'CDL-A', 'CDL-B', 'CDL-C', 'Other'];
const GENDER_OPTIONS = ['male', 'female', 'other', 'prefer_not_to_say'];

/**
 * Driver Form component for creating and editing drivers
 * @returns {JSX.Element} Driver Form component
 */
const DriverForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isEditMode = Boolean(id);
  
  // State for form data
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [createUserAccount, setCreateUserAccount] = useState(true);
  
  // Check if user has permission to access this page
  useEffect(() => {
    if (user?.role !== ROLES.ADMIN) {
      navigate('/drivers');
    }
  }, [user, navigate]);
  
  // Fetch driver data if in edit mode
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch driver details
        const response = await driverService.getDriverById(id, token);
        const driverData = response.data.driver;
        
        // Set form values
        formik.setValues({
          firstName: driverData.firstName || '',
          lastName: driverData.lastName || '',
          email: driverData.email || '',
          phone: driverData.phone || '',
          dateOfBirth: driverData.dateOfBirth ? new Date(driverData.dateOfBirth).toISOString().split('T')[0] : '',
          gender: driverData.gender || '',
          address: driverData.address || '',
          licenseNumber: driverData.licenseNumber || '',
          licenseType: driverData.licenseType || '',
          licenseIssueDate: driverData.licenseIssueDate ? new Date(driverData.licenseIssueDate).toISOString().split('T')[0] : '',
          licenseExpiry: driverData.licenseExpiry ? new Date(driverData.licenseExpiry).toISOString().split('T')[0] : '',
          licenseRestrictions: driverData.licenseRestrictions || '',
          hireDate: driverData.hireDate ? new Date(driverData.hireDate).toISOString().split('T')[0] : '',
          employeeId: driverData.employeeId || '',
          status: driverData.status || 'available',
          assignedVehicleId: driverData.assignedVehicle?._id || '',
          notes: driverData.notes || '',
          password: '', // Password field is empty in edit mode
          confirmPassword: ''
        });
        
        // In edit mode, we don't need to create a user account
        setCreateUserAccount(false);
      } catch (err) {
        console.error('Error fetching driver data:', err);
        setError('Failed to load driver data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch available vehicles
    const fetchAvailableVehicles = async () => {
      try {
        const response = await vehicleService.getVehicles({ status: 'active' }, token);
        setAvailableVehicles(response.data.vehicles || []);
      } catch (err) {
        console.error('Error fetching available vehicles:', err);
      }
    };
    
    if (token) {
      fetchAvailableVehicles();
      
      if (isEditMode) {
        fetchDriverData();
      }
    }
  }, [id, token, isEditMode]);
  
  // Form validation schema
  const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    dateOfBirth: Yup.date()
      .max(new Date(), 'Date of birth cannot be in the future')
      .required('Date of birth is required'),
    gender: Yup.string(),
    address: Yup.string(),
    licenseNumber: Yup.string().required('License number is required'),
    licenseType: Yup.string().required('License type is required'),
    licenseIssueDate: Yup.date()
      .max(new Date(), 'License issue date cannot be in the future')
      .required('License issue date is required'),
    licenseExpiry: Yup.date()
      .min(new Date(), 'License expiry date must be in the future')
      .required('License expiry date is required'),
    licenseRestrictions: Yup.string(),
    hireDate: Yup.date().required('Hire date is required'),
    employeeId: Yup.string(),
    status: Yup.string().required('Status is required'),
    assignedVehicleId: Yup.string(),
    notes: Yup.string(),
    password: Yup.string()
      .when('$createUserAccount', {
        is: true,
        then: Yup.string()
          .min(8, 'Password must be at least 8 characters')
          .required('Password is required')
      }),
    confirmPassword: Yup.string()
      .when('$createUserAccount', {
        is: true,
        then: Yup.string()
          .oneOf([Yup.ref('password'), null], 'Passwords must match')
          .required('Confirm password is required')
      })
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      licenseNumber: '',
      licenseType: '',
      licenseIssueDate: '',
      licenseExpiry: '',
      licenseRestrictions: '',
      hireDate: '',
      employeeId: '',
      status: 'available',
      assignedVehicleId: '',
      notes: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    context: { createUserAccount },
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError(null);
        
        // Prepare payload
        const payload = { ...values };
        
        // Remove password fields if not creating user account
        if (!createUserAccount) {
          delete payload.password;
          delete payload.confirmPassword;
        }
        
        // Create or update driver
        if (isEditMode) {
          await driverService.updateDriver(id, payload, token);
        } else {
          await driverService.createDriver(payload, token);
        }
        
        // Navigate back to drivers list
        navigate('/drivers');
      } catch (err) {
        console.error('Error saving driver:', err);
        setError(`Failed to ${isEditMode ? 'update' : 'create'} driver. Please try again.`);
      } finally {
        setSubmitting(false);
      }
    }
  });
  
  // Handle create user account toggle
  const handleCreateUserAccountChange = (event) => {
    setCreateUserAccount(event.target.checked);
    
    // Clear password fields if not creating user account
    if (!event.target.checked) {
      formik.setFieldValue('password', '');
      formik.setFieldValue('confirmPassword', '');
    }
  };
  
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
          <IconButton onClick={() => navigate('/drivers')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Edit Driver' : 'Add New Driver'}
          </Typography>
        </Box>
      </Box>
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Driver form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} />
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name *"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name *"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email *"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone *"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="dateOfBirth"
                name="dateOfBirth"
                label="Date of Birth *"
                type="date"
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.gender && Boolean(formik.errors.gender)}
              >
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Gender"
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  {GENDER_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.gender && formik.errors.gender && (
                  <FormHelperText>{formik.errors.gender}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                name="address"
                label="Address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
                multiline
                rows={2}
              />
            </Grid>
            
            {/* License Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                License Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="licenseNumber"
                name="licenseNumber"
                label="License Number *"
                value={formik.values.licenseNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.licenseNumber && Boolean(formik.errors.licenseNumber)}
                helperText={formik.touched.licenseNumber && formik.errors.licenseNumber}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.licenseType && Boolean(formik.errors.licenseType)}
              >
                <InputLabel id="licenseType-label">License Type *</InputLabel>
                <Select
                  labelId="licenseType-label"
                  id="licenseType"
                  name="licenseType"
                  value={formik.values.licenseType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="License Type *"
                >
                  <MenuItem value="">Select License Type</MenuItem>
                  {LICENSE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.licenseType && formik.errors.licenseType && (
                  <FormHelperText>{formik.errors.licenseType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="licenseIssueDate"
                name="licenseIssueDate"
                label="License Issue Date *"
                type="date"
                value={formik.values.licenseIssueDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.licenseIssueDate && Boolean(formik.errors.licenseIssueDate)}
                helperText={formik.touched.licenseIssueDate && formik.errors.licenseIssueDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="licenseExpiry"
                name="licenseExpiry"
                label="License Expiry Date *"
                type="date"
                value={formik.values.licenseExpiry}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.licenseExpiry && Boolean(formik.errors.licenseExpiry)}
                helperText={formik.touched.licenseExpiry && formik.errors.licenseExpiry}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="licenseRestrictions"
                name="licenseRestrictions"
                label="License Restrictions"
                value={formik.values.licenseRestrictions}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.licenseRestrictions && Boolean(formik.errors.licenseRestrictions)}
                helperText={formik.touched.licenseRestrictions && formik.errors.licenseRestrictions}
              />
            </Grid>
            
            {/* Employment Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                Employment Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="hireDate"
                name="hireDate"
                label="Hire Date *"
                type="date"
                value={formik.values.hireDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.hireDate && Boolean(formik.errors.hireDate)}
                helperText={formik.touched.hireDate && formik.errors.hireDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="employeeId"
                name="employeeId"
                label="Employee ID"
                value={formik.values.employeeId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
                helperText={formik.touched.employeeId && formik.errors.employeeId}
              />
            </Grid>
            
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
                  {DRIVER_STATUS.map((status) => (
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
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="assignedVehicleId-label">Assigned Vehicle</InputLabel>
                <Select
                  labelId="assignedVehicleId-label"
                  id="assignedVehicleId"
                  name="assignedVehicleId"
                  value={formik.values.assignedVehicleId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Assigned Vehicle"
                >
                  <MenuItem value="">None</MenuItem>
                  {availableVehicles.map((vehicle) => (
                    <MenuItem key={vehicle._id} value={vehicle._id}>
                      {`${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            
            {/* User Account Information */}
            {!isEditMode && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                    User Account
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={createUserAccount}
                        onChange={handleCreateUserAccountChange}
                        color="primary"
                      />
                    }
                    label="Create user account for this driver"
                  />
                </Grid>
                
                {createUserAccount && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="password"
                        name="password"
                        label="Password *"
                        type="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm Password *"
                        type="password"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                      />
                    </Grid>
                  </>
                )}
              </>
            )}
            
            {/* Form Actions */}
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/drivers')}
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
                  isEditMode ? 'Update Driver' : 'Create Driver'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default DriverForm;
