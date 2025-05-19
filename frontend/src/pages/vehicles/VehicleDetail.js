/**
 * Vehicle Detail Page
 * Displays detailed information about a specific vehicle
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  Chip,
  Button,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import notificationService from '../../services/notificationService';
import { 
  DirectionsCar as CarIcon,
  Speed as SpeedIcon,
  LocalGasStation as FuelIcon,
  Build as MaintenanceIcon,
  CalendarToday as CalendarIcon,
  Person as DriverIcon,
  Map as TripIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import vehicleService from '../../services/vehicleService';
import tripService from '../../services/tripService';
import maintenanceService from '../../services/maintenanceService';
import { ROLES } from '../../constants/roles';

/**
 * Function component for tab panels
 * @param {Object} props - Component props
 * @returns {JSX.Element} Tab panel component
 */
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vehicle-tabpanel-${index}`}
      aria-labelledby={`vehicle-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Vehicle Detail component showing comprehensive information about a vehicle
 * @returns {JSX.Element} Vehicle Detail page
 */
const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [vehicle, setVehicle] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trips, setTrips] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [assignedDriver, setAssignedDriver] = useState(null);

  /**
   * Fetch vehicle data from API
   */
  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Direct API call with axios for better error handling
      const response = await axios.get(`${API_BASE_URL}/vehicles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Vehicle API Response:', response.data);
      
      // Handle different possible response structures
      let vehicleData;
      if (response.data.data && response.data.data.vehicle) {
        vehicleData = response.data.data.vehicle;
      } else if (response.data.vehicle) {
        vehicleData = response.data.vehicle;
      } else if (response.data.data) {
        vehicleData = response.data.data;
      } else {
        vehicleData = response.data;
      }
      
      setVehicle(vehicleData);
      
      // Set assigned driver if available
      if (vehicleData.currentDriver) {
        setAssignedDriver(vehicleData.currentDriver);
      }
      
      // Fetch related trips
      try {
        const tripsResponse = await tripService.getTripsByVehicleId(id, token);
        setTrips(tripsResponse.data.trips || []);
      } catch (tripError) {
        console.error('Error fetching trips:', tripError);
        setTrips([]);
      }
      
      // Fetch maintenance records
      try {
        const maintenanceResponse = await maintenanceService.getMaintenanceByVehicleId(id, token);
        setMaintenanceRecords(maintenanceResponse.data.maintenanceRecords || []);
      } catch (maintenanceError) {
        console.error('Error fetching maintenance records:', maintenanceError);
        setMaintenanceRecords([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching vehicle details:', err);
      setError('Failed to load vehicle details. Please try again.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (token && id) {
      fetchVehicleData();
    }
  }, [id, token]);
  
  /**
   * Handle tab change
   * @param {Event} event - Event object
   * @param {Number} newValue - New tab value
   */
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  /**
   * Get status chip for vehicle status
   * @param {String} status - Vehicle status
   * @returns {JSX.Element} Status chip
   */
  const getStatusChip = (status) => {
    if (!status) return <Chip label="Unknown" color="default" size="small" />;
    
    switch (status.toLowerCase()) {
      case 'active':
        return <Chip label="Active" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'maintenance':
        return <Chip label="In Maintenance" color="warning" size="small" icon={<MaintenanceIcon />} />;
      case 'inactive':
        return <Chip label="Inactive" color="error" size="small" icon={<WarningIcon />} />;
      default:
        return <Chip label={status} color="default" size="small" icon={<InfoIcon />} />;
    }
  };
  
  /**
   * Format date to readable format
   * @param {String} dateString - Date string
   * @returns {String} Formatted date
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  /**
   * Navigate to vehicle edit page
   */
  const handleEditVehicle = () => {
    navigate(`/vehicles/edit/${id}`);
  };
  
  /**
   * Delete vehicle
   */
  const handleDeleteVehicle = async () => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.deleteVehicle(id, token);
        notificationService.showSuccess('Vehicle deleted successfully');
        navigate('/vehicles');
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        notificationService.showError('Failed to delete vehicle', err);
      }
    }
  };
  
  /**
   * Navigate to trip detail page
   * @param {String} tripId - Trip ID
   */
  const handleViewTrip = (tripId) => {
    navigate(`/trips/${tripId}`);
  };
  
  /**
   * Navigate to maintenance detail page
   * @param {String} maintenanceId - Maintenance ID
   */
  const handleViewMaintenance = (maintenanceId) => {
    navigate(`/maintenance/${maintenanceId}`);
  };
  
  /**
   * Navigate to driver detail page
   * @param {String} driverId - Driver ID
   */
  const handleViewDriver = (driverId) => {
    navigate(`/drivers/${driverId}`);
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
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/vehicles')}
        >
          Back to Vehicles
        </Button>
      </Box>
    );
  }
  
  // Show not found state
  if (!vehicle || Object.keys(vehicle).length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Vehicle not found or data is incomplete. Please try again.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/vehicles')}
        >
          Back to Vehicles
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/vehicles')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Vehicle Details
          </Typography>
        </Box>
        {user?.role === ROLES.ADMIN && (
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditVehicle}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteVehicle}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Vehicle basic info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <CarIcon />
              </Avatar>
              <Typography variant="h5">
                {vehicle.make || 'Unknown Make'} {vehicle.model || 'Unknown Model'} ({vehicle.year || 'N/A'})
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                License Plate:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {vehicle.licensePlate || 'Not Available'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                Status:
              </Typography>
              {getStatusChip(vehicle.status)}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                VIN:
              </Typography>
              <Typography variant="body1">
                {vehicle.vinNumber || 'N/A'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Current Status</Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <SpeedIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Odometer" 
                      secondary={vehicle.odometer ? `${vehicle.odometer} km` : 'N/A'} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <FuelIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Fuel Level" 
                      secondary={vehicle.fuelLevel ? `${vehicle.fuelLevel}%` : 'N/A'} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <MaintenanceIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Last Maintenance" 
                      secondary={formatDate(vehicle.lastMaintenanceDate)} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Registration Date" 
                      secondary={formatDate(vehicle.registrationDate)} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <DriverIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Assigned Driver" 
                      secondary={
                        assignedDriver ? (
                          <Button 
                            size="small" 
                            onClick={() => handleViewDriver(assignedDriver._id)}
                          >
                            {assignedDriver.name}
                          </Button>
                        ) : 'None'
                      } 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs for related information */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Overview" />
          <Tab label="Trip History" />
          <Tab label="Maintenance Records" />
        </Tabs>
        
        {/* Overview tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Vehicle Information" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Make</Typography>
                      <Typography variant="body1">{vehicle.make || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Model</Typography>
                      <Typography variant="body1">{vehicle.model || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Year</Typography>
                      <Typography variant="body1">{vehicle.year || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Type</Typography>
                      <Typography variant="body1">{vehicle.type || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Color</Typography>
                      <Typography variant="body1">{vehicle.color || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">VIN</Typography>
                      <Typography variant="body1">{vehicle.vinNumber || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">License Plate</Typography>
                      <Typography variant="body1">{vehicle.licensePlate || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Registration Date</Typography>
                      <Typography variant="body1">{formatDate(vehicle.registrationDate)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Technical Specifications" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Engine Type</Typography>
                      <Typography variant="body1">{vehicle.engineType || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Transmission</Typography>
                      <Typography variant="body1">{vehicle.transmission || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Fuel Type</Typography>
                      <Typography variant="body1">{vehicle.fuelType || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Fuel Capacity</Typography>
                      <Typography variant="body1">{vehicle.fuelCapacity ? `${vehicle.fuelCapacity} L` : 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Seating Capacity</Typography>
                      <Typography variant="body1">{vehicle.seatingCapacity || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Mileage</Typography>
                      <Typography variant="body1">{vehicle.mileage ? `${vehicle.mileage} km/L` : 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Trip History tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Trip History</Typography>
          
          {trips && trips.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Distance</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip._id}>
                      <TableCell>{formatDate(trip.date)}</TableCell>
                      <TableCell>{trip.startLocation || 'N/A'}</TableCell>
                      <TableCell>{trip.endLocation || 'N/A'}</TableCell>
                      <TableCell>{trip.distance ? `${trip.distance} km` : 'N/A'}</TableCell>
                      <TableCell>{trip.driver?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleViewTrip(trip._id)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No trip history available for this vehicle.</Alert>
          )}
        </TabPanel>
        
        {/* Maintenance Records tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Maintenance Records</Typography>
            {user?.role === ROLES.ADMIN && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate(`/maintenance/add?vehicleId=${id}`)}
              >
                Add Maintenance Record
              </Button>
            )}
          </Box>
          
          {maintenanceRecords && maintenanceRecords.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maintenanceRecords.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{record.type || 'N/A'}</TableCell>
                      <TableCell>{record.description || 'N/A'}</TableCell>
                      <TableCell>${record.cost ? record.cost.toFixed(2) : 'N/A'}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleViewMaintenance(record._id)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No maintenance records available for this vehicle.</Alert>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default VehicleDetail;
