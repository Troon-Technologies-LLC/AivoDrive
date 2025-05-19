/**
 * Driver Detail Page
 * Displays detailed information about a specific driver
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
import { 
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  DriveEta as LicenseIcon,
  Event as CalendarIcon,
  DirectionsCar as CarIcon,
  Map as TripIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import driverService from '../../services/driverService';
import vehicleService from '../../services/vehicleService';
import tripService from '../../services/tripService';
import { ROLES } from '../../constants/roles';

/**
 * TabPanel component for tabbed content
 * @param {Object} props - Component props
 * @returns {JSX.Element} TabPanel component
 */
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`driver-tabpanel-${index}`}
      aria-labelledby={`driver-tab-${index}`}
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
 * Driver Detail component showing comprehensive information about a driver
 * @returns {JSX.Element} Driver Detail page
 */
const DriverDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // State for driver data
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for related data
  const [trips, setTrips] = useState([]);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Fetch driver data on component mount
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch driver details
        const response = await driverService.getDriverById(id, token);
        setDriver(response.data.driver);
        
        // Fetch related data in parallel
        const [tripsResponse, vehicleResponse] = await Promise.all([
          tripService.getTrips({ driverId: id }, token),
          vehicleService.getVehicles({ assignedDriverId: id }, token)
        ]);
        
        setTrips(tripsResponse.data.trips || []);
        
        // Set assigned vehicle if available
        if (vehicleResponse.data.vehicles && vehicleResponse.data.vehicles.length > 0) {
          setAssignedVehicle(vehicleResponse.data.vehicles[0]);
        }
      } catch (err) {
        console.error('Error fetching driver data:', err);
        setError('Failed to load driver data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && id) {
      fetchDriverData();
    }
  }, [id, token]);
  
  /**
   * Handle tab change
   * @param {Object} event - Event object
   * @param {Number} newValue - New tab value
   */
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  /**
   * Get status chip for driver status
   * @param {String} status - Driver status
   * @returns {JSX.Element} Status chip
   */
  const getStatusChip = (status) => {
    switch (status) {
      case 'available':
        return <Chip icon={<CheckCircleIcon />} label="Available" color="success" />;
      case 'on_trip':
        return <Chip icon={<TripIcon />} label="On Trip" color="warning" />;
      case 'off_duty':
        return <Chip icon={<ScheduleIcon />} label="Off Duty" color="default" />;
      case 'inactive':
        return <Chip icon={<WarningIcon />} label="Inactive" color="error" />;
      default:
        return <Chip icon={<InfoIcon />} label={status} />;
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
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  /**
   * Calculate days until license expiry
   * @param {String} expiryDate - License expiry date
   * @returns {Number} Days until expiry
   */
  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  /**
   * Navigate to driver edit page
   */
  const handleEditDriver = () => {
    navigate(`/drivers/edit/${id}`);
  };
  
  /**
   * Delete driver
   */
  const handleDeleteDriver = async () => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await driverService.deleteDriver(id, token);
        navigate('/drivers');
      } catch (err) {
        console.error('Error deleting driver:', err);
        alert('Failed to delete driver. Please try again.');
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
          onClick={() => navigate('/drivers')}
        >
          Back to Drivers
        </Button>
      </Box>
    );
  }
  
  // Show not found state
  if (!driver) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Driver not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/drivers')}
        >
          Back to Drivers
        </Button>
      </Box>
    );
  }
  
  // Calculate days until license expiry
  const daysUntilExpiry = getDaysUntilExpiry(driver.licenseExpiry);
  
  return (
    <Box>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/drivers')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Driver Details
          </Typography>
        </Box>
        {user?.role === ROLES.ADMIN && (
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditDriver}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteDriver}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Driver summary card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
                <PersonIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5">{driver.name || `${driver.firstName} ${driver.lastName}`}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Driver ID: {driver._id}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              {getStatusChip(driver.status)}
              
              {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                <Chip 
                  icon={<WarningIcon />} 
                  label={`License expires in ${daysUntilExpiry} days`} 
                  color={daysUntilExpiry <= 7 ? 'error' : 'warning'}
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                </Box>
                <Typography variant="body1">{driver.email || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                </Box>
                <Typography variant="body1">{driver.phone || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LicenseIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">License Number</Typography>
                </Box>
                <Typography variant="body1">{driver.licenseNumber || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">License Expiry</Typography>
                </Box>
                <Typography variant="body1">{formatDate(driver.licenseExpiry)}</Typography>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Current Assignment</Typography>
                
                {assignedVehicle ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <CarIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">{`${assignedVehicle.make} ${assignedVehicle.model}`}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignedVehicle.licensePlate}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleViewVehicle(assignedVehicle._id)}
                    >
                      View Vehicle Details
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No vehicle currently assigned to this driver.
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            {driver.status === 'on_trip' && trips.length > 0 && (
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Current Trip</Typography>
                  
                  {trips.find(trip => trip.status === 'in_progress') ? (
                    <Box>
                      {(() => {
                        const currentTrip = trips.find(trip => trip.status === 'in_progress');
                        return (
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                <TripIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1">{currentTrip.title || 'Trip in Progress'}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Started: {formatDate(currentTrip.startTime)}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <LocationIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />
                                  <Typography variant="body2" color="text.secondary">Origin</Typography>
                                </Box>
                                <Typography variant="body2">{currentTrip.origin}</Typography>
                              </Grid>
                              
                              <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <LocationIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />
                                  <Typography variant="body2" color="text.secondary">Destination</Typography>
                                </Box>
                                <Typography variant="body2">{currentTrip.destination}</Typography>
                              </Grid>
                            </Grid>
                            
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => handleViewTrip(currentTrip._id)}
                            >
                              View Trip Details
                            </Button>
                          </>
                        );
                      })()} 
                    </Box>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Driver is marked as on trip, but no active trip was found.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
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
          <Tab label="Driver Information" />
          <Tab label="Trip History" />
          <Tab label="Documents" />
        </Tabs>
        
        {/* Driver Information tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Personal Information" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">First Name</Typography>
                      <Typography variant="body1">{driver.firstName || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Last Name</Typography>
                      <Typography variant="body1">{driver.lastName || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                      <Typography variant="body1">{formatDate(driver.dateOfBirth)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Gender</Typography>
                      <Typography variant="body1">{driver.gender || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Address</Typography>
                      <Typography variant="body1">{driver.address || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="License Information" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">License Number</Typography>
                      <Typography variant="body1">{driver.licenseNumber || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">License Type</Typography>
                      <Typography variant="body1">{driver.licenseType || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Issue Date</Typography>
                      <Typography variant="body1">{formatDate(driver.licenseIssueDate)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Expiry Date</Typography>
                      <Typography variant="body1">
                        {formatDate(driver.licenseExpiry)}
                        {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                          <Chip 
                            size="small" 
                            label={`Expires in ${daysUntilExpiry} days`} 
                            color={daysUntilExpiry <= 7 ? 'error' : 'warning'}
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Restrictions</Typography>
                      <Typography variant="body1">{driver.licenseRestrictions || 'None'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card sx={{ mt: 3 }}>
                <CardHeader title="Employment Information" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Hire Date</Typography>
                      <Typography variant="body1">{formatDate(driver.hireDate)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Employee ID</Typography>
                      <Typography variant="body1">{driver.employeeId || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Notes</Typography>
                      <Typography variant="body1">{driver.notes || 'No additional notes'}</Typography>
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
          
          {trips.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Origin</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Vehicle</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip._id}>
                      <TableCell>{trip.origin}</TableCell>
                      <TableCell>{trip.destination}</TableCell>
                      <TableCell>
                        {trip.vehicle ? (
                          <Button 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewVehicle(trip.vehicle._id);
                            }}
                          >
                            {`${trip.vehicle.make} ${trip.vehicle.model}`}
                          </Button>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(trip.startTime)}</TableCell>
                      <TableCell>{formatDate(trip.endTime)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={trip.status} 
                          size="small" 
                          color={
                            trip.status === 'completed' ? 'success' : 
                            trip.status === 'in_progress' ? 'warning' : 
                            trip.status === 'cancelled' ? 'error' : 'default'
                          } 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => handleViewTrip(trip._id)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No trip history available for this driver.
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        {/* Documents tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Driver Documents</Typography>
            {user?.role === ROLES.ADMIN && (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => alert('Document upload feature coming soon!')}
              >
                Upload Document
              </Button>
            )}
          </Box>
          
          {/* This would be populated with actual documents in a full implementation */}
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No documents available for this driver.
            </Typography>
            {user?.role === ROLES.ADMIN && (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => alert('Document upload feature coming soon!')}
                sx={{ mt: 2 }}
              >
                Upload Document
              </Button>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default DriverDetail;
