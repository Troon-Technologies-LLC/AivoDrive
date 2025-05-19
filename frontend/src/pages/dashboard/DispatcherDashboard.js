/**
 * Dispatcher Dashboard Component
 * Dashboard view for dispatcher users focused on trip management and vehicle/driver availability
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
  Add as AddIcon,
  PlayArrow as InProgressIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Dispatcher Dashboard component focused on trip management
 * @param {Object} props - Component props
 * @param {Object} props.data - Dashboard data from API
 * @returns {JSX.Element} Dispatcher Dashboard component
 */
const DispatcherDashboard = ({ data }) => {
  const navigate = useNavigate();
  
  // Prepare data for trip status chart
  const tripStatusData = {
    labels: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          data?.tripStats?.byStatus?.scheduled || 0,
          data?.tripStats?.byStatus?.in_progress || 0,
          data?.tripStats?.byStatus?.completed || 0,
          data?.tripStats?.byStatus?.cancelled || 0
        ],
        backgroundColor: ['#64B5F6', '#FFB74D', '#81C784', '#E57373'],
        borderColor: ['#42A5F5', '#FFA726', '#66BB6A', '#EF5350'],
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#E0E0E0',
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
    },
  };
  
  // Get active vehicles and available drivers from data
  const activeVehicles = data?.activeVehicles?.data || [];
  const availableDrivers = data?.availableDrivers?.data || [];
  
  // Get today's trips (mock data for MVP)
  const todaysTrips = [
    {
      id: '1',
      origin: 'Headquarters',
      destination: 'Airport',
      driver: 'John Doe',
      vehicle: 'Toyota Camry (ABC-1234)',
      startTime: '09:00 AM',
      status: 'in_progress'
    },
    {
      id: '2',
      origin: 'Warehouse A',
      destination: 'Client Office',
      driver: 'Jane Smith',
      vehicle: 'Honda Civic (DEF-9012)',
      startTime: '10:30 AM',
      status: 'scheduled'
    },
    {
      id: '3',
      origin: 'Distribution Center',
      destination: 'Retail Store',
      driver: 'Mike Johnson',
      vehicle: 'Ford Transit (XYZ-5678)',
      startTime: '08:15 AM',
      status: 'completed'
    }
  ];
  
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
  
  return (
    <Grid container spacing={3}>
      {/* Summary cards */}
      <Grid item xs={12} sm={6} md={4}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TripIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">Today's Trips</Typography>
          </Box>
          <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            {data?.tripStats?.today || 0}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              {data?.tripStats?.byStatus?.in_progress || 0} In Progress
            </Typography>
            <Button size="small" onClick={() => navigate('/trips')}>View All</Button>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CarIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">Available Vehicles</Typography>
          </Box>
          <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            {activeVehicles.length || 0}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
            <Button size="small" onClick={() => navigate('/vehicles')}>View All</Button>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <DriverIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">Available Drivers</Typography>
          </Box>
          <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            {availableDrivers.length || 0}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
            <Button size="small" onClick={() => navigate('/drivers')}>View All</Button>
          </Box>
        </Paper>
      </Grid>
      
      {/* Trip status chart */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>Trip Status</Typography>
          <Box sx={{ height: 300, mt: 2 }}>
            <Doughnut data={tripStatusData} options={chartOptions} />
          </Box>
        </Paper>
      </Grid>
      
      {/* Today's trips */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Today's Trips</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/trips/new')}
            >
              New Trip
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Origin</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {todaysTrips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>{trip.origin}</TableCell>
                    <TableCell>{trip.destination}</TableCell>
                    <TableCell>{trip.driver}</TableCell>
                    <TableCell>{trip.vehicle}</TableCell>
                    <TableCell>{trip.startTime}</TableCell>
                    <TableCell>{getStatusChip(trip.status)}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => navigate(`/trips/${trip.id}`)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button onClick={() => navigate('/trips')}>View All Trips</Button>
          </Box>
        </Paper>
      </Grid>
      
      {/* Available resources */}
      <Grid item xs={12} sm={6}>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>Available Vehicles</Typography>
          <Divider sx={{ my: 2 }} />
          
          <List>
            {activeVehicles.length > 0 ? (
              activeVehicles.slice(0, 5).map((vehicle, index) => (
                <React.Fragment key={vehicle._id || index}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <CarIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${vehicle.make} ${vehicle.model}`} 
                      secondary={vehicle.licensePlate}
                    />
                    <Button size="small" variant="outlined" onClick={() => navigate(`/vehicles/${vehicle._id}`)}>Details</Button>
                  </ListItem>
                  {index < activeVehicles.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No available vehicles" />
              </ListItem>
            )}
          </List>
          
          {activeVehicles.length > 5 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button onClick={() => navigate('/vehicles')}>View All Vehicles</Button>
            </Box>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>Available Drivers</Typography>
          <Divider sx={{ my: 2 }} />
          
          <List>
            {availableDrivers.length > 0 ? (
              availableDrivers.slice(0, 5).map((driver, index) => (
                <React.Fragment key={driver._id || index}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <DriverIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={driver.userId?.name || 'Unknown Driver'} 
                      secondary={driver.licenseNumber}
                    />
                    <Button size="small" variant="outlined" onClick={() => navigate(`/drivers/${driver._id}`)}>Details</Button>
                  </ListItem>
                  {index < availableDrivers.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No available drivers" />
              </ListItem>
            )}
          </List>
          
          {availableDrivers.length > 5 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button onClick={() => navigate('/drivers')}>View All Drivers</Button>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DispatcherDashboard;
