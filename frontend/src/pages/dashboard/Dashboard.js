/**
 * Dashboard Page
 * Main dashboard with role-specific views and statistics
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Button,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

// Import services
import vehicleService from '../../services/vehicleService';
import driverService from '../../services/driverService';
import tripService from '../../services/tripService';
import maintenanceService from '../../services/maintenanceService';
import reportService from '../../services/reportService';
import alertService from '../../services/alertService';

// Import role-specific dashboard components
import AdminDashboard from './AdminDashboard';
import DispatcherDashboard from './DispatcherDashboard';
import DriverDashboard from './DriverDashboard';

/**
 * Dashboard page component with role-specific views
 * @returns {JSX.Element} Dashboard page
 */
const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Fetch dashboard data based on user role
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data = {};
        
        // Admin dashboard data
        if (user?.role === ROLES.ADMIN) {
          try {
            // Fetch data individually with error handling for each request
            let dailySummary = { data: { dailySummary: {} } };
            let vehicleStats = { data: { stats: {} } };
            let driverStats = { data: { stats: {} } };
            let tripStats = { data: { stats: {} } };
            let maintenanceStats = { data: { stats: {} } };
            let alerts = { data: { alerts: [] } };
            
            try {
              dailySummary = await reportService.getDailySummary(token);
              console.log('Daily summary loaded successfully');
            } catch (err) {
              console.error('Failed to load daily summary:', err);
            }
            
            try {
              vehicleStats = await vehicleService.getVehicleStats(token);
              console.log('Vehicle stats loaded successfully');
            } catch (err) {
              console.error('Failed to load vehicle stats:', err);
            }
            
            try {
              driverStats = await driverService.getDriverStats(token);
              console.log('Driver stats loaded successfully');
            } catch (err) {
              console.error('Failed to load driver stats:', err);
            }
            
            try {
              tripStats = await tripService.getTripStats(token);
              console.log('Trip stats loaded successfully');
            } catch (err) {
              console.error('Failed to load trip stats:', err);
            }
            
            try {
              maintenanceStats = await maintenanceService.getMaintenanceStats(token);
              console.log('Maintenance stats loaded successfully');
            } catch (err) {
              console.error('Failed to load maintenance stats:', err);
            }
            
            try {
              alerts = await alertService.getAlerts({ limit: 5 }, token);
              console.log('Alerts loaded successfully');
            } catch (err) {
              console.error('Failed to load alerts:', err);
            }
            
            data = {
              dailySummary: dailySummary.data?.dailySummary || {},
              vehicleStats: vehicleStats.data?.stats || {},
              driverStats: driverStats.data?.stats || {},
              tripStats: tripStats.data?.stats || {},
              maintenanceStats: maintenanceStats.data?.stats || {},
              alerts: alerts.data?.alerts || []
            };
          } catch (err) {
            console.error('Error in admin dashboard data fetching:', err);
          }
        }
        // Dispatcher dashboard data
        else if (user?.role === ROLES.DISPATCHER) {
          try {
            // Fetch data individually with error handling for each request
            let tripStats = { data: { stats: {} } };
            let vehicles = { data: [] };
            let drivers = { data: [] };
            let todaysTrips = { data: { trips: [] } };
            
            try {
              tripStats = await tripService.getTripStats(token);
              console.log('Trip stats loaded successfully');
            } catch (err) {
              console.error('Failed to load trip stats:', err);
            }
            
            try {
              vehicles = await vehicleService.getVehicles({ status: 'active' }, token);
              console.log('Active vehicles loaded successfully');
            } catch (err) {
              console.error('Failed to load active vehicles:', err);
            }
            
            try {
              drivers = await driverService.getDrivers({ status: 'available' }, token);
              console.log('Available drivers loaded successfully');
            } catch (err) {
              console.error('Failed to load available drivers:', err);
            }
            
            try {
              todaysTrips = await tripService.getTrips({ date: new Date().toISOString().split('T')[0] }, token);
              console.log('Today\'s trips loaded successfully');
            } catch (err) {
              console.error('Failed to load today\'s trips:', err);
            }
            
            data = {
              tripStats: tripStats.data?.stats || {},
              activeVehicles: vehicles.data || [],
              availableDrivers: drivers.data || [],
              todaysTrips: todaysTrips.data?.trips || []
            };
          } catch (err) {
            console.error('Error in dispatcher dashboard data fetching:', err);
          }
        }
        // Driver dashboard data
        else if (user?.role === ROLES.DRIVER) {
          try {
            // Fetch data individually with error handling for each request
            let driverProfile = { data: { status: 'Unknown' } };
            let assignedVehicle = { data: {} };
            let trips = { data: [] };
            
            try {
              driverProfile = await driverService.getDriverProfile(token);
              console.log('Driver profile loaded successfully');
            } catch (err) {
              console.error('Failed to load driver profile:', err);
            }
            
            try {
              assignedVehicle = await vehicleService.getAssignedVehicle(token);
              console.log('Assigned vehicle loaded successfully');
            } catch (err) {
              console.error('Failed to load assigned vehicle:', err);
            }
            
            try {
              trips = await tripService.getDriverTrips(token);
              console.log('Driver trips loaded successfully');
            } catch (err) {
              console.error('Failed to load driver trips:', err);
            }
            
            data = {
              driverName: user?.name || 'Driver',
              driverStatus: driverProfile.data?.status || 'Unknown',
              assignedVehicle: assignedVehicle.data || {},
              trips: trips.data || []
            };
          } catch (err) {
            console.error('Error in driver dashboard data fetching:', err);
          }
        }
        
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, token]);
  
  /**
   * Get welcome message based on time of day and user role
   * @returns {String} Personalized welcome message
   */
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    return `${greeting}, ${user?.name || 'User'}!`;
  };
  
  /**
   * Get role-specific subtitle for dashboard
   * @returns {String} Role-specific subtitle
   */
  const getRoleSubtitle = () => {
    switch (user?.role) {
      case ROLES.ADMIN:
        return 'Fleet Management System Administrator Dashboard';
      case ROLES.DISPATCHER:
        return 'Trip Management and Dispatch Dashboard';
      case ROLES.DRIVER:
        return 'Driver Operations Dashboard';
      default:
        return 'Smart Fleet Management System';
    }
  };
  
  // This function is not needed as we're rendering directly in the return statement
  
  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          variant="filled"
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
        
        <Paper sx={{ p: 4, bgcolor: 'background.paper' }}>
          <Typography variant="h5" gutterBottom>Unable to load dashboard</Typography>
          <Typography variant="body1" paragraph>
            We're having trouble loading your dashboard data. This could be due to a network issue or a temporary server problem.
          </Typography>
          <Typography variant="body1">
            You can try refreshing the page or navigate to other sections of the application using the sidebar menu.
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  // Check if user is not authenticated
  if (!user || !token) {
    navigate('/login');
    return null;
  }
  
  // Render dashboard based on user role
  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {getWelcomeMessage()}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {getRoleSubtitle()}
        </Typography>
        <Divider sx={{ mt: 2, mb: 4 }} />
      </Box>
      
      {/* Render different dashboard based on user role */}
      {console.log('Current user role in render:', user?.role)}
      {console.log('Available roles:', ROLES)}
      {console.log('Is admin?', user?.role === ROLES.ADMIN)}
      {console.log('Dashboard data available:', !!dashboardData)}
      
      {user?.role === ROLES.ADMIN && (
        <>
          {console.log('Rendering AdminDashboard')}
          <AdminDashboard data={dashboardData} />
        </>
      )}
      
      {user?.role === ROLES.DISPATCHER && (
        <>
          {console.log('Rendering DispatcherDashboard')}
          <DispatcherDashboard data={dashboardData} />
        </>
      )}
      
      {user?.role === ROLES.DRIVER && (
        <>
          {console.log('Rendering DriverDashboard')}
          <DriverDashboard data={dashboardData} />
        </>
      )}
      
      {!user?.role && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No user role detected. Please try logging in again.
        </Alert>
      )}
    </Box>
  );
};

export default Dashboard;
