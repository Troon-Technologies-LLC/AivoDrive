/**
 * Driver Dashboard Component
 * Dashboard view for driver users focused on their assigned trips and vehicle status
 */

import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  DirectionsCar as CarIcon,
  Person as DriverIcon,
  Map as TripIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as InProgressIcon,
  Build as MaintenanceIcon,
  Warning as WarningIcon,
  LocalGasStation as FuelIcon,
  Speed as SpeedIcon,
  Navigation as NavigationIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Driver Dashboard component focused on assigned trips and vehicle status
 * @param {Object} props - Component props
 * @param {Object} props.data - Dashboard data from API
 * @returns {JSX.Element} Driver Dashboard component
 */
const DriverDashboard = ({ data }) => {
  const navigate = useNavigate();
  
  // Get driver's assigned vehicle from data
  const assignedVehicle = data?.assignedVehicle || null;
  
  // Get driver's trips from data
  const upcomingTrips = data?.trips?.upcoming || [];
  const completedTrips = data?.trips?.completed || [];
  
  // Get current trip if any
  const currentTrip = data?.trips?.current || null;
  
  /**
   * Get status chip for trip status
   * @param {String} status - Trip status
   * @returns {JSX.Element} Status chip
   */
  const getStatusChip = (status) => {
    switch (status) {
      case 'scheduled':
        return <Chip icon={<ScheduleIcon />} label="Scheduled" size="small" color="info" />;
      case 'in_progress':
        return <Chip icon={<InProgressIcon />} label="In Progress" size="small" color="warning" />;
      case 'completed':
        return <Chip icon={<CheckCircleIcon />} label="Completed" size="small" color="success" />;
      case 'cancelled':
        return <Chip icon={<CancelIcon />} label="Cancelled" size="small" color="error" />;
      default:
        return <Chip label={status} size="small" />;
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
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Grid container spacing={3}>
      {/* Current status card */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>Current Status</Typography>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
                  <DriverIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5">{data?.driverName || 'Driver'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {data?.driverStatus ? (
                      <Chip 
                        label={data.driverStatus} 
                        size="small" 
                        color={data.driverStatus === 'Available' ? 'success' : data.driverStatus === 'On Trip' ? 'warning' : 'default'} 
                      />
                    ) : 'Unknown'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {assignedVehicle ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
                    <CarIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {assignedVehicle.make} {assignedVehicle.model}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      License Plate: {assignedVehicle.licensePlate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {assignedVehicle.status ? (
                        <Chip 
                          label={assignedVehicle.status} 
                          size="small" 
                          color={assignedVehicle.status === 'Active' ? 'success' : assignedVehicle.status === 'Maintenance' ? 'warning' : 'default'} 
                        />
                      ) : 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography>No vehicle assigned</Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      {/* Current trip card */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>Current Trip</Typography>
          <Divider sx={{ my: 2 }} />
          
          {currentTrip ? (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h5">{currentTrip.title || 'Trip Details'}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getStatusChip(currentTrip.status)}
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        Started: {formatDate(currentTrip.startTime)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>Origin</Typography>
                          <Typography variant="h6">{currentTrip.origin}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>Destination</Typography>
                          <Typography variant="h6">{currentTrip.destination}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="body1" paragraph>
                    {currentTrip.description || 'No additional details provided.'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<NavigationIcon />}
                      onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(currentTrip.destination)}`, '_blank')}
                    >
                      Navigate
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      color="success" 
                      startIcon={<CheckCircleIcon />}
                      onClick={() => alert('Trip completion feature coming soon!')}
                    >
                      Complete Trip
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<WarningIcon />}
                      onClick={() => alert('Report issue feature coming soon!')}
                    >
                      Report Issue
                    </Button>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Contact Information</Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <PhoneIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Dispatcher" 
                            secondary={currentTrip.dispatcherPhone || '+1 (555) 123-4567'}
                          />
                          <IconButton color="primary" edge="end" aria-label="call">
                            <PhoneIcon />
                          </IconButton>
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <PhoneIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Emergency" 
                            secondary="+1 (555) 911-0000"
                          />
                          <IconButton color="error" edge="end" aria-label="call">
                            <PhoneIcon />
                          </IconButton>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                  
                  {assignedVehicle && (
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Vehicle Status</Typography>
                        
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <FuelIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Fuel Level" 
                              secondary={`${assignedVehicle.fuelLevel || 'N/A'}`}
                            />
                          </ListItem>
                          
                          <ListItem>
                            <ListItemIcon>
                              <SpeedIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Odometer" 
                              secondary={`${assignedVehicle.odometer || 'N/A'} km`}
                            />
                          </ListItem>
                          
                          <ListItem>
                            <ListItemIcon>
                              <MaintenanceIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Next Maintenance" 
                              secondary={assignedVehicle.nextMaintenanceDate ? formatDate(assignedVehicle.nextMaintenanceDate) : 'N/A'}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  )}
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No active trip
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You don't have any trips in progress at the moment.
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
      
      {/* Upcoming trips */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>Upcoming Trips</Typography>
          <Divider sx={{ my: 2 }} />
          
          {upcomingTrips.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Origin</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Scheduled</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingTrips.map((trip) => (
                    <TableRow key={trip._id}>
                      <TableCell>{trip.origin}</TableCell>
                      <TableCell>{trip.destination}</TableCell>
                      <TableCell>{formatDate(trip.scheduledStartTime)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => navigate(`/trips/${trip._id}`)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No upcoming trips scheduled.
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
      
      {/* Recent trips */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>Recent Trips</Typography>
          <Divider sx={{ my: 2 }} />
          
          {completedTrips.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Origin</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedTrips.map((trip) => (
                    <TableRow key={trip._id}>
                      <TableCell>{trip.origin}</TableCell>
                      <TableCell>{trip.destination}</TableCell>
                      <TableCell>{formatDate(trip.completedAt)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => navigate(`/trips/${trip._id}`)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No completed trips yet.
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DriverDashboard;
