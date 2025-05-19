/**
 * Admin Dashboard Component
 * Dashboard view for admin users with comprehensive statistics and charts
 * Updated with modern UI design based on reference images
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
  Avatar,
  IconButton
} from '@mui/material';
import { 
  DirectionsCar as CarIcon,
  Person as DriverIcon,
  Map as TripIcon,
  Build as MaintenanceIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  LocalGasStation as FuelIcon,
  AttachMoney as CostIcon,
  Speed as PerformanceIcon,
  BarChart as UtilizationIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

/**
 * Admin Dashboard component with comprehensive statistics and charts
 * @param {Object} props - Component props
 * @param {Object} props.data - Dashboard data from API
 * @returns {JSX.Element} Admin Dashboard component
 */
const AdminDashboard = ({ data }) => {
  const navigate = useNavigate();
  
  // Prepare data for vehicle status chart (using doughnut chart)
  const vehicleStatusData = {
    labels: ['Active', 'Maintenance', 'Inactive', 'Retired'],
    datasets: [
      {
        data: [
          data?.vehicleStats?.byStatus?.active || 6,
          data?.vehicleStats?.byStatus?.maintenance || 2,
          data?.vehicleStats?.byStatus?.inactive || 0,
          data?.vehicleStats?.byStatus?.retired || 0
        ],
        backgroundColor: ['#4caf50', '#2196f3', '#9e9e9e', '#f44336'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };
  
  // Prepare data for driver status chart (using doughnut chart)
  const driverStatusData = {
    labels: ['Active', 'Inactive', 'On Leave', 'Terminated'],
    datasets: [
      {
        data: [
          data?.driverStats?.byStatus?.available || 3,
          data?.driverStats?.byStatus?.inactive || 1,
          data?.driverStats?.byStatus?.on_leave || 1,
          data?.driverStats?.byStatus?.terminated || 0
        ],
        backgroundColor: ['#4caf50', '#9e9e9e', '#2196f3', '#f44336'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };
  
  // Prepare data for maintenance status chart (using doughnut chart)
  const maintenanceStatusData = {
    labels: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Overdue'],
    datasets: [
      {
        data: [
          data?.maintenanceStats?.byStatus?.scheduled || 2,
          data?.maintenanceStats?.byStatus?.in_progress || 1,
          data?.maintenanceStats?.byStatus?.completed || 1,
          data?.maintenanceStats?.byStatus?.cancelled || 0,
          data?.maintenanceStats?.byStatus?.overdue || 0
        ],
        backgroundColor: ['#2196f3', '#ffc107', '#4caf50', '#9e9e9e', '#f44336'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };
  
  // Prepare data for cost analysis chart (bar chart)
  const costAnalysisData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Fuel Cost',
        data: [4000, 3500, 5000, 3200, 4800, 4200],
        backgroundColor: '#26a69a',
        barPercentage: 0.6,
      },
      {
        label: 'Maintenance Cost',
        data: [1500, 1800, 1700, 1500, 1800, 1700],
        backgroundColor: '#ffa726',
        barPercentage: 0.6,
      }
    ],
  };
  
  // Prepare data for fuel efficiency trend (line chart)
  const fuelEfficiencyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'MPG',
        data: [26.2, 26.8, 27.2, 27.8, 28.2, 28.5],
        borderColor: '#26a69a',
        backgroundColor: 'rgba(38, 166, 154, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#26a69a',
        pointRadius: 4,
      },
    ],
  };
  
  // Prepare data for weekly trips chart (bar chart)
  const weeklyTripsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Trips',
        data: [5, 8, 6, 9, 7, 3, 2],
        backgroundColor: '#26a69a',
        borderWidth: 0,
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };
  
  // Chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#e0e0e0',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
        padding: 10,
        bodyFont: {
          family: 'Inter, sans-serif',
        },
        titleFont: {
          family: 'Inter, sans-serif',
        },
      },
    },
    cutout: '70%',
  };
  
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#e0e0e0',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#e0e0e0',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
        padding: 10,
        bodyFont: {
          family: 'Inter, sans-serif',
        },
        titleFont: {
          family: 'Inter, sans-serif',
        },
      },
    },
  };
  
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: '#e0e0e0',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#e0e0e0',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
        padding: 10,
        bodyFont: {
          family: 'Inter, sans-serif',
        },
        titleFont: {
          family: 'Inter, sans-serif',
        },
      },
    },
  };
  
  return (
    <Box>
      

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">Fuel Efficiency</Typography>
              <Avatar sx={{ bgcolor: 'rgba(38, 166, 154, 0.2)', width: 40, height: 40 }}>
                <FuelIcon sx={{ color: '#26a69a' }} />
              </Avatar>
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>28.5</Typography>
            <Typography variant="caption" sx={{ color: '#4caf50', display: 'flex', alignItems: 'center' }}>
              ↑ 2.3% <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>vs target: 30mpg</Typography>
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">Maintenance Cost</Typography>
              <Avatar sx={{ bgcolor: 'rgba(244, 67, 54, 0.2)', width: 40, height: 40 }}>
                <CostIcon sx={{ color: '#f44336' }} />
              </Avatar>
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>0.12</Typography>
            <Typography variant="caption" sx={{ color: '#f44336', display: 'flex', alignItems: 'center' }}>
              ↓ -1.5% <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>vs target: 0.15/mile</Typography>
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">Driver Performance</Typography>
              <Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.2)', width: 40, height: 40 }}>
                <PerformanceIcon sx={{ color: '#4caf50' }} />
              </Avatar>
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>87%</Typography>
            <Typography variant="caption" sx={{ color: '#4caf50', display: 'flex', alignItems: 'center' }}>
              ↑ 3.2% <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>vs target: 90%</Typography>
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">Vehicle Utilization</Typography>
              <Avatar sx={{ bgcolor: 'rgba(33, 150, 243, 0.2)', width: 40, height: 40 }}>
                <UtilizationIcon sx={{ color: '#2196f3' }} />
              </Avatar>
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>76%</Typography>
            <Typography variant="caption" sx={{ color: '#2196f3', display: 'flex', alignItems: 'center' }}>
              ↑ 0.5% <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>vs target: 80%</Typography>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Status Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>Vehicle Status</Typography>
            <Box sx={{ height: 300, mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut data={vehicleStatusData} options={doughnutOptions} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>Driver Status</Typography>
            <Box sx={{ height: 300, mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut data={driverStatusData} options={doughnutOptions} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>Maintenance Status</Typography>
            <Box sx={{ height: 300, mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut data={maintenanceStatusData} options={doughnutOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Cost Analysis</Typography>
              <Box>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: 'divider', color: 'text.secondary', fontSize: 12 }}
                >
                  This Week ▼
                </Button>
              </Box>
            </Box>
            <Box sx={{ height: 300, mt: 2 }}>
              <Bar data={costAnalysisData} options={barOptions} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>Fuel Efficiency Trend</Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <Line data={fuelEfficiencyData} options={lineOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Active Vehicles Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Active Vehicles</Typography>
        <Grid container spacing={3}>
          {/* Vehicle Card 1 */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#333', mr: 2 }}>
                  <CarIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Toyota Camry</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50', mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">Active</Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Fuel Level</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <Box sx={{ height: 4, bgcolor: '#333', borderRadius: 2, position: 'relative' }}>
                      <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '36%', bgcolor: '#26a69a', borderRadius: 2 }} />
                    </Box>
                  </Box>
                  <Typography variant="body2">36%</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Odometer</Typography>
                <Typography variant="body2">27,822 mi</Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">Last Location</Typography>
                <Typography variant="body2">Location 1</Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Vehicle Card 2 */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#333', mr: 2 }}>
                  <CarIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Ford F-150</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50', mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">Active</Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Fuel Level</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <Box sx={{ height: 4, bgcolor: '#333', borderRadius: 2, position: 'relative' }}>
                      <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '42%', bgcolor: '#26a69a', borderRadius: 2 }} />
                    </Box>
                  </Box>
                  <Typography variant="body2">42%</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Odometer</Typography>
                <Typography variant="body2">21,422 mi</Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">Last Location</Typography>
                <Typography variant="body2">Location 2</Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Vehicle Card 3 */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#333', mr: 2 }}>
                  <CarIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Honda Civic</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50', mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">Active</Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Fuel Level</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <Box sx={{ height: 4, bgcolor: '#333', borderRadius: 2, position: 'relative' }}>
                      <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '53%', bgcolor: '#26a69a', borderRadius: 2 }} />
                    </Box>
                  </Box>
                  <Typography variant="body2">53%</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Odometer</Typography>
                <Typography variant="body2">42,149 mi</Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">Last Location</Typography>
                <Typography variant="body2">Location 3</Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Vehicle Card 4 */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#333', mr: 2 }}>
                  <CarIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Chevrolet Silverado</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff9800', mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">Maintenance</Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Fuel Level</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <Box sx={{ height: 4, bgcolor: '#333', borderRadius: 2, position: 'relative' }}>
                      <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '20%', bgcolor: '#f44336', borderRadius: 2 }} />
                    </Box>
                  </Box>
                  <Typography variant="body2">20%</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Odometer</Typography>
                <Typography variant="body2">24,034 mi</Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">Last Location</Typography>
                <Typography variant="body2">Location 4</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
