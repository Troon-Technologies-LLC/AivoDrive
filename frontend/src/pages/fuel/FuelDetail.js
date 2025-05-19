/**
 * Fuel Detail Page
 * Displays detailed information about a specific fuel record
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  Button,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  LocalGasStation as FuelIcon,
  DirectionsCar as VehicleIcon,
  Person as DriverIcon,
  Schedule as DateIcon,
  LocationOn as LocationIcon,
  AttachMoney as CostIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Speed as OdometerIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import fuelService from '../../services/fuelService';
import vehicleService from '../../services/vehicleService';
import { ROLES } from '../../constants/roles';

/**
 * Fuel Detail component showing comprehensive information about a fuel record
 * @returns {JSX.Element} Fuel Detail page
 */
const FuelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // State for fuel data
  const [fuel, setFuel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for vehicle data
  const [vehicle, setVehicle] = useState(null);
  
  // Fetch fuel data on component mount
  useEffect(() => {
    const fetchFuelData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch fuel details
        const response = await fuelService.getFuelById(id, token);
        setFuel(response.data.fuelRecord);
        
        // Fetch vehicle details if available
        if (response.data.fuelRecord.vehicle) {
          const vehicleId = response.data.fuelRecord.vehicle._id;
          const vehicleResponse = await vehicleService.getVehicleById(vehicleId, token);
          setVehicle(vehicleResponse.data.vehicle);
        }
      } catch (err) {
        console.error('Error fetching fuel data:', err);
        setError('Failed to load fuel record data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && id) {
      fetchFuelData();
    }
  }, [id, token]);
  
  /**
   * Format date to readable format
   * @param {String} dateString - Date string
   * @returns {String} Formatted date
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  /**
   * Format time to readable format
   * @param {String} dateString - Date string
   * @returns {String} Formatted time
   */
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Format currency
   * @param {Number} amount - Amount
   * @returns {String} Formatted currency
   */
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `$${parseFloat(amount).toFixed(2)}`;
  };
  
  /**
   * Format fuel amount
   * @param {Number} amount - Amount
   * @returns {String} Formatted fuel amount
   */
  const formatFuelAmount = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `${parseFloat(amount).toFixed(2)} L`;
  };
  
  /**
   * Navigate to fuel edit page
   */
  const handleEditFuel = () => {
    navigate(`/fuel/edit/${id}`);
  };
  
  /**
   * Delete fuel record
   */
  const handleDeleteFuel = async () => {
    if (window.confirm('Are you sure you want to delete this fuel record?')) {
      try {
        await fuelService.deleteFuel(id, token);
        navigate('/fuel');
      } catch (err) {
        console.error('Error deleting fuel record:', err);
        alert('Failed to delete fuel record. Please try again.');
      }
    }
  };
  
  /**
   * Navigate to vehicle detail page
   * @param {String} vehicleId - Vehicle ID
   */
  const handleViewVehicle = (vehicleId) => {
    navigate(`/vehicles/${vehicleId}`);
  };
  
  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/fuel')}
        >
          Back to Fuel Records
        </Button>
      </Box>
    );
  }
  
  // Show not found state
  if (!fuel) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Fuel record not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/fuel')}
        >
          Back to Fuel Records
        </Button>
      </Box>
    );
  }
  
  // Check if user has permission to edit/delete fuel records
  const canEditFuel = user?.role === ROLES.ADMIN || user?.role === ROLES.DISPATCHER;
  
  // Calculate fuel efficiency if odometer and previous odometer are available
  const fuelEfficiency = fuel.previousOdometer && fuel.odometer && fuel.fuelAmount
    ? ((fuel.odometer - fuel.previousOdometer) / fuel.fuelAmount).toFixed(2)
    : null;
  
  return (
    <Box>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/fuel')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Fuel Record Details
          </Typography>
        </Box>
        <Box>
          {canEditFuel && (
            <>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEditFuel}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteFuel}
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      </Box>
      
      {/* Fuel record summary card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
                <FuelIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5">Fuel Record</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  ID: {fuel._id}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DateIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                </Box>
                <Typography variant="body1">{formatDate(fuel.date)}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DateIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Time</Typography>
                </Box>
                <Typography variant="body1">{formatTime(fuel.date)}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FuelIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Fuel Amount</Typography>
                </Box>
                <Typography variant="body1">{formatFuelAmount(fuel.fuelAmount)}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CostIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Price per Liter</Typography>
                </Box>
                <Typography variant="body1">{formatCurrency(fuel.fuelPrice)}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CostIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Total Cost</Typography>
                </Box>
                <Typography variant="body1">{formatCurrency(fuel.totalCost)}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <OdometerIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Odometer Reading</Typography>
                </Box>
                <Typography variant="body1">{fuel.odometer ? `${fuel.odometer} km` : 'N/A'}</Typography>
              </Grid>
              
              {fuel.previousOdometer && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <OdometerIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">Previous Odometer</Typography>
                  </Box>
                  <Typography variant="body1">{`${fuel.previousOdometer} km`}</Typography>
                </Grid>
              )}
              
              {fuelEfficiency && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InfoIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">Fuel Efficiency</Typography>
                  </Box>
                  <Typography variant="body1">{`${fuelEfficiency} km/L`}</Typography>
                </Grid>
              )}
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Fuel Station</Typography>
                </Box>
                <Typography variant="body1">{fuel.fuelStation || 'N/A'}</Typography>
              </Grid>
              
              {fuel.notes && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InfoIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">Notes</Typography>
                  </Box>
                  <Typography variant="body1">{fuel.notes}</Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Vehicle Information</Typography>
                
                {vehicle ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <VehicleIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">{`${vehicle.make} ${vehicle.model}`}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {vehicle.licensePlate}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Status" 
                          secondary={vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Current Odometer" 
                          secondary={vehicle.odometer ? `${vehicle.odometer} km` : 'N/A'} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Fuel Type" 
                          secondary={vehicle.fuelType || 'N/A'} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Fuel Capacity" 
                          secondary={vehicle.fuelCapacity ? `${vehicle.fuelCapacity} L` : 'N/A'} 
                        />
                      </ListItem>
                    </List>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleViewVehicle(vehicle._id)}
                      sx={{ mt: 1 }}
                    >
                      View Vehicle Details
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No vehicle information available
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            {/* Additional information card */}
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Additional Information</Typography>
                
                <Grid container spacing={2}>
                  {fuel.driver && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DriverIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">Driver</Typography>
                      </Box>
                      <Typography variant="body1">{fuel.driver.name || `${fuel.driver.firstName} ${fuel.driver.lastName}`}</Typography>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <InfoIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">Created By</Typography>
                    </Box>
                    <Typography variant="body1">{fuel.createdBy?.name || 'N/A'}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DateIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">Created At</Typography>
                    </Box>
                    <Typography variant="body1">{formatDate(fuel.createdAt)}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default FuelDetail;
