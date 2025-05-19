/**
 * Maintenance Detail Page
 * Displays detailed information about a specific maintenance record
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  Build as MaintenanceIcon,
  DirectionsCar as VehicleIcon,
  Person as MechanicIcon,
  Schedule as ScheduleIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  AttachMoney as CostIcon,
  Notes as NotesIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import maintenanceService from '../../services/maintenanceService';
import vehicleService from '../../services/vehicleService';
import { ROLES } from '../../constants/roles';

/**
 * Maintenance Detail component showing comprehensive information about a maintenance record
 * @returns {JSX.Element} Maintenance Detail page
 */
const MaintenanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // State for maintenance data
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for vehicle data
  const [vehicle, setVehicle] = useState(null);
  
  // State for action dialogs
  const [startMaintenanceDialog, setStartMaintenanceDialog] = useState(false);
  const [completeMaintenanceDialog, setCompleteMaintenanceDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Fetch maintenance data on component mount
  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch maintenance details
        const response = await maintenanceService.getMaintenanceById(id, token);
        setMaintenance(response.data.maintenance);
        
        // Fetch vehicle details if available
        if (response.data.maintenance.vehicle) {
          const vehicleId = response.data.maintenance.vehicle._id;
          const vehicleResponse = await vehicleService.getVehicleById(vehicleId, token);
          setVehicle(vehicleResponse.data.vehicle);
        }
      } catch (err) {
        console.error('Error fetching maintenance data:', err);
        setError('Failed to load maintenance data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && id) {
      fetchMaintenanceData();
    }
  }, [id, token]);
  
  /**
   * Get status chip for maintenance status
   * @param {String} status - Maintenance status
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
      case 'overdue':
        return <Chip icon={<WarningIcon />} label="Overdue" color="error" />;
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
   * Format currency
   * @param {Number} amount - Amount
   * @returns {String} Formatted currency
   */
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `$${parseFloat(amount).toFixed(2)}`;
  };
  
  /**
   * Navigate to maintenance edit page
   */
  const handleEditMaintenance = () => {
    navigate(`/maintenance/edit/${id}`);
  };
  
  /**
   * Delete maintenance
   */
  const handleDeleteMaintenance = async () => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        await maintenanceService.deleteMaintenance(id, token);
        navigate('/maintenance');
      } catch (err) {
        console.error('Error deleting maintenance record:', err);
        alert('Failed to delete maintenance record. Please try again.');
      }
    }
  };
  
  /**
   * Start maintenance
   */
  const handleStartMaintenance = async () => {
    try {
      setActionLoading(true);
      await maintenanceService.updateMaintenanceStatus(id, { status: 'in_progress' }, token);
      setStartMaintenanceDialog(false);
      // Refresh maintenance data
      const response = await maintenanceService.getMaintenanceById(id, token);
      setMaintenance(response.data.maintenance);
    } catch (err) {
      console.error('Error starting maintenance:', err);
      alert('Failed to start maintenance. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  /**
   * Complete maintenance
   */
  const handleCompleteMaintenance = async () => {
    try {
      setActionLoading(true);
      await maintenanceService.updateMaintenanceStatus(id, { 
        status: 'completed',
        completionNotes: completionNotes,
        completedAt: new Date().toISOString()
      }, token);
      setCompleteMaintenanceDialog(false);
      // Refresh maintenance data
      const response = await maintenanceService.getMaintenanceById(id, token);
      setMaintenance(response.data.maintenance);
    } catch (err) {
      console.error('Error completing maintenance:', err);
      alert('Failed to complete maintenance. Please try again.');
    } finally {
      setActionLoading(false);
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
          onClick={() => navigate('/maintenance')}
        >
          Back to Maintenance
        </Button>
      </Box>
    );
  }
  
  // Show not found state
  if (!maintenance) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Maintenance record not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/maintenance')}
        >
          Back to Maintenance
        </Button>
      </Box>
    );
  }
  
  // Check if user has permission to edit/delete maintenance records
  const canEditMaintenance = user?.role === ROLES.ADMIN;
  
  return (
    <Box>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/maintenance')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Maintenance Details
          </Typography>
        </Box>
        <Box>
          {canEditMaintenance && maintenance.status !== 'completed' && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditMaintenance}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
          )}
          {canEditMaintenance && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteMaintenance}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Maintenance summary card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
                <MaintenanceIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5">{maintenance.maintenanceType.charAt(0).toUpperCase() + maintenance.maintenanceType.slice(1)} Maintenance</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  ID: {maintenance._id}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              {getStatusChip(maintenance.status)}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <NotesIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Description</Typography>
                </Box>
                <Typography variant="body1">{maintenance.description || 'No description provided'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ScheduleIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Scheduled Date</Typography>
                </Box>
                <Typography variant="body1">{formatDate(maintenance.date)}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CostIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Estimated Cost</Typography>
                </Box>
                <Typography variant="body1">{formatCurrency(maintenance.cost)}</Typography>
              </Grid>
              
              {maintenance.status === 'completed' && maintenance.completedAt && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CompleteIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">Completed Date</Typography>
                  </Box>
                  <Typography variant="body1">{formatDate(maintenance.completedAt)}</Typography>
                </Grid>
              )}
              
              {maintenance.status === 'completed' && maintenance.completionNotes && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <NotesIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">Completion Notes</Typography>
                  </Box>
                  <Typography variant="body1">{maintenance.completionNotes}</Typography>
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
                          primary="Odometer" 
                          secondary={vehicle.odometer ? `${vehicle.odometer} km` : 'N/A'} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Last Maintenance" 
                          secondary={formatDate(vehicle.lastMaintenanceDate)} 
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
            
            {/* Maintenance actions */}
            {canEditMaintenance && maintenance.status !== 'completed' && (
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Maintenance Actions</Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {maintenance.status === 'scheduled' && (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<StartIcon />}
                        onClick={() => setStartMaintenanceDialog(true)}
                      >
                        Start Maintenance
                      </Button>
                    )}
                    
                    {maintenance.status === 'in_progress' && (
                      <Button 
                        variant="contained" 
                        color="success" 
                        startIcon={<CompleteIcon />}
                        onClick={() => setCompleteMaintenanceDialog(true)}
                      >
                        Complete Maintenance
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Additional maintenance details */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Additional Details</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MechanicIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Mechanic/Technician</Typography>
            </Box>
            <Typography variant="body1">{maintenance.mechanic || 'Not assigned'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InfoIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Odometer at Service</Typography>
            </Box>
            <Typography variant="body1">{maintenance.odometerAtService ? `${maintenance.odometerAtService} km` : 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InfoIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Created By</Typography>
            </Box>
            <Typography variant="body1">{maintenance.createdBy?.name || 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InfoIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Created At</Typography>
            </Box>
            <Typography variant="body1">{formatDate(maintenance.createdAt)}</Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Start Maintenance Dialog */}
      <Dialog open={startMaintenanceDialog} onClose={() => setStartMaintenanceDialog(false)}>
        <DialogTitle>Start Maintenance</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to start this maintenance? This will mark the maintenance as in progress.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartMaintenanceDialog(false)} disabled={actionLoading}>Cancel</Button>
          <Button 
            onClick={handleStartMaintenance} 
            color="primary" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Start Maintenance'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Complete Maintenance Dialog */}
      <Dialog open={completeMaintenanceDialog} onClose={() => setCompleteMaintenanceDialog(false)}>
        <DialogTitle>Complete Maintenance</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this maintenance as completed? Please provide any completion notes.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="completionNotes"
            label="Completion Notes"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteMaintenanceDialog(false)} disabled={actionLoading}>Cancel</Button>
          <Button 
            onClick={handleCompleteMaintenance} 
            color="success" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Complete Maintenance'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenanceDetail;
