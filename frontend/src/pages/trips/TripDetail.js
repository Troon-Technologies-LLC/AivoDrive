/**
 * Trip Detail Page
 * Displays detailed information about a specific trip
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
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  Map as TripIcon,
  Person as DriverIcon,
  DirectionsCar as VehicleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Navigation as NavigationIcon,
  AccessTime as TimeIcon,
  Info as InfoIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import tripService from '../../services/tripService';
import { ROLES } from '../../constants/roles';

/**
 * Trip Detail component showing comprehensive information about a trip
 * @returns {JSX.Element} Trip Detail page
 */
const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // State for trip data
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for action dialogs
  const [startTripDialog, setStartTripDialog] = useState(false);
  const [completeTripDialog, setCompleteTripDialog] = useState(false);
  const [cancelTripDialog, setCancelTripDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Fetch trip data on component mount
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch trip details
        const response = await tripService.getTripById(id, token);
        setTrip(response.data.trip);
      } catch (err) {
        console.error('Error fetching trip data:', err);
        setError('Failed to load trip data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && id) {
      fetchTripData();
    }
  }, [id, token]);
  
  /**
   * Get status chip for trip status
   * @param {String} status - Trip status
   * @returns {JSX.Element} Status chip
   */
  const getStatusChip = (status) => {
    switch (status) {
      case 'scheduled':
        return <Chip icon={<ScheduleIcon />} label="Scheduled" color="info" />;
      case 'in_progress':
        return <Chip icon={<StartIcon />} label="In Progress" color="warning" />;
      case 'completed':
        return <Chip icon={<CompleteIcon />} label="Completed" color="success" />;
      case 'cancelled':
        return <Chip icon={<CancelIcon />} label="Cancelled" color="error" />;
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Calculate trip duration
   * @returns {String} Formatted duration
   */
  const calculateDuration = () => {
    if (!trip.startTime || !trip.endTime) return 'N/A';
    
    const start = new Date(trip.startTime);
    const end = new Date(trip.endTime);
    const diffMs = end - start;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours} hours, ${minutes} minutes`;
  };
  
  /**
   * Navigate to trip edit page
   */
  const handleEditTrip = () => {
    navigate(`/trips/edit/${id}`);
  };
  
  /**
   * Delete trip
   */
  const handleDeleteTrip = async () => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await tripService.deleteTrip(id, token);
        navigate('/trips');
      } catch (err) {
        console.error('Error deleting trip:', err);
        alert('Failed to delete trip. Please try again.');
      }
    }
  };
  
  /**
   * Start trip
   */
  const handleStartTrip = async () => {
    try {
      setActionLoading(true);
      await tripService.updateTripStatus(id, { status: 'in_progress' }, token);
      setStartTripDialog(false);
      // Refresh trip data
      const response = await tripService.getTripById(id, token);
      setTrip(response.data.trip);
    } catch (err) {
      console.error('Error starting trip:', err);
      alert('Failed to start trip. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  /**
   * Complete trip
   */
  const handleCompleteTrip = async () => {
    try {
      setActionLoading(true);
      await tripService.updateTripStatus(id, { status: 'completed' }, token);
      setCompleteTripDialog(false);
      // Refresh trip data
      const response = await tripService.getTripById(id, token);
      setTrip(response.data.trip);
    } catch (err) {
      console.error('Error completing trip:', err);
      alert('Failed to complete trip. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  /**
   * Cancel trip
   */
  const handleCancelTrip = async () => {
    try {
      setActionLoading(true);
      await tripService.updateTripStatus(id, { 
        status: 'cancelled',
        cancellationReason: cancelReason 
      }, token);
      setCancelTripDialog(false);
      // Refresh trip data
      const response = await tripService.getTripById(id, token);
      setTrip(response.data.trip);
    } catch (err) {
      console.error('Error cancelling trip:', err);
      alert('Failed to cancel trip. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  /**
   * Navigate to driver detail page
   * @param {String} driverId - Driver ID
   */
  const handleViewDriver = (driverId) => {
    navigate(`/drivers/${driverId}`);
  };
  
  /**
   * Navigate to vehicle detail page
   * @param {String} vehicleId - Vehicle ID
   */
  const handleViewVehicle = (vehicleId) => {
    navigate(`/vehicles/${vehicleId}`);
  };
  
  /**
   * Get trip status step index
   * @returns {Number} Step index
   */
  const getTripStatusStep = () => {
    switch (trip?.status) {
      case 'scheduled': return 0;
      case 'in_progress': return 1;
      case 'completed': return 2;
      case 'cancelled': return 3;
      default: return 0;
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
  
  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/trips')}
        >
          Back to Trips
        </Button>
      </Box>
    );
  }
  
  // Show not found state
  if (!trip) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Trip not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/trips')}
        >
          Back to Trips
        </Button>
      </Box>
    );
  }
  
  // Check if user has permission to edit/delete trips
  const canEditTrip = user?.role === ROLES.ADMIN || user?.role === ROLES.DISPATCHER;
  
  // Check if user is the assigned driver
  const isAssignedDriver = user?.role === ROLES.DRIVER && trip.driver?._id === user.driverId;
  
  return (
    <Box>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/trips')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Trip Details
          </Typography>
        </Box>
        <Box>
          {canEditTrip && trip.status !== 'completed' && trip.status !== 'cancelled' && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditTrip}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
          )}
          {canEditTrip && trip.status !== 'in_progress' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteTrip}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Trip summary card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
                <TripIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5">{trip.title || 'Trip'}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Trip ID: {trip._id}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              {getStatusChip(trip.status)}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Origin</Typography>
                </Box>
                <Typography variant="body1">{trip.origin || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Destination</Typography>
                </Box>
                <Typography variant="body1">{trip.destination || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TimeIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Start Time</Typography>
                </Box>
                <Typography variant="body1">{formatDate(trip.startTime)}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TimeIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">End Time</Typography>
                </Box>
                <Typography variant="body1">{formatDate(trip.endTime)}</Typography>
              </Grid>
              
              {trip.status === 'completed' && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimeIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">Duration</Typography>
                  </Box>
                  <Typography variant="body1">{calculateDuration()}</Typography>
                </Grid>
              )}
              
              {trip.status === 'cancelled' && trip.cancellationReason && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InfoIcon color="error" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">Cancellation Reason</Typography>
                  </Box>
                  <Typography variant="body1">{trip.cancellationReason}</Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Assigned Resources</Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <DriverIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Driver" 
                      secondary={
                        trip.driver ? (
                          <Button 
                            size="small" 
                            onClick={() => handleViewDriver(trip.driver._id)}
                          >
                            {trip.driver.name || `${trip.driver.firstName} ${trip.driver.lastName}`}
                          </Button>
                        ) : 'Unassigned'
                      } 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <VehicleIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Vehicle" 
                      secondary={
                        trip.vehicle ? (
                          <Button 
                            size="small" 
                            onClick={() => handleViewVehicle(trip.vehicle._id)}
                          >
                            {`${trip.vehicle.make} ${trip.vehicle.model} (${trip.vehicle.licensePlate})`}
                          </Button>
                        ) : 'Unassigned'
                      } 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
            
            {/* Trip actions */}
            {(canEditTrip || isAssignedDriver) && (
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Trip Actions</Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {trip.status === 'scheduled' && (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<StartIcon />}
                        onClick={() => setStartTripDialog(true)}
                      >
                        Start Trip
                      </Button>
                    )}
                    
                    {trip.status === 'in_progress' && (
                      <Button 
                        variant="contained" 
                        color="success" 
                        startIcon={<CompleteIcon />}
                        onClick={() => setCompleteTripDialog(true)}
                      >
                        Complete Trip
                      </Button>
                    )}
                    
                    {(trip.status === 'scheduled' || trip.status === 'in_progress') && (
                      <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<CancelIcon />}
                        onClick={() => setCancelTripDialog(true)}
                      >
                        Cancel Trip
                      </Button>
                    )}
                    
                    {trip.status !== 'cancelled' && (
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        startIcon={<NavigationIcon />}
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(trip.destination)}`, '_blank')}
                      >
                        Navigate to Destination
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Trip status stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Trip Status</Typography>
        <Stepper activeStep={getTripStatusStep()} alternativeLabel sx={{ mt: 3 }}>
          <Step>
            <StepLabel>Scheduled</StepLabel>
          </Step>
          <Step>
            <StepLabel>In Progress</StepLabel>
          </Step>
          <Step>
            <StepLabel>Completed</StepLabel>
          </Step>
        </Stepper>
        {trip.status === 'cancelled' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Chip icon={<CancelIcon />} label="Trip Cancelled" color="error" />
          </Box>
        )}
      </Paper>
      
      {/* Trip details */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Trip Details</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <NotesIcon color="primary" sx={{ mr: 1, mt: 0.5, fontSize: 20 }} />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>Description</Typography>
                <Typography variant="body1" paragraph>
                  {trip.description || 'No description provided.'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InfoIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Distance</Typography>
            </Box>
            <Typography variant="body1">{trip.distance ? `${trip.distance} km` : 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InfoIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Estimated Duration</Typography>
            </Box>
            <Typography variant="body1">{trip.estimatedDuration ? `${trip.estimatedDuration} minutes` : 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InfoIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Created By</Typography>
            </Box>
            <Typography variant="body1">{trip.createdBy?.name || 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InfoIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Created At</Typography>
            </Box>
            <Typography variant="body1">{formatDate(trip.createdAt)}</Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Start Trip Dialog */}
      <Dialog open={startTripDialog} onClose={() => setStartTripDialog(false)}>
        <DialogTitle>Start Trip</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to start this trip? This will mark the trip as in progress.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartTripDialog(false)} disabled={actionLoading}>Cancel</Button>
          <Button 
            onClick={handleStartTrip} 
            color="primary" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Start Trip'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Complete Trip Dialog */}
      <Dialog open={completeTripDialog} onClose={() => setCompleteTripDialog(false)}>
        <DialogTitle>Complete Trip</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this trip as completed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteTripDialog(false)} disabled={actionLoading}>Cancel</Button>
          <Button 
            onClick={handleCompleteTrip} 
            color="success" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Complete Trip'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Trip Dialog */}
      <Dialog open={cancelTripDialog} onClose={() => setCancelTripDialog(false)}>
        <DialogTitle>Cancel Trip</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this trip? Please provide a reason for cancellation.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="cancelReason"
            label="Cancellation Reason"
            type="text"
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelTripDialog(false)} disabled={actionLoading}>Back</Button>
          <Button 
            onClick={handleCancelTrip} 
            color="error" 
            variant="contained"
            disabled={actionLoading || !cancelReason.trim()}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Cancel Trip'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripDetail;
