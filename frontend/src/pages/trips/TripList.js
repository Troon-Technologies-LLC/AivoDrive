/**
 * Trip List Page
 * Displays a list of all trips with filtering, sorting, and pagination
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Map as TripIcon,
  Schedule as ScheduleIcon,
  PlayArrow as InProgressIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import tripService from '../../services/tripService';
import { ROLES } from '../../constants/roles';

/**
 * Trip List component with filtering, sorting, and pagination
 * @returns {JSX.Element} Trip List page
 */
const TripList = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // State for trips data
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTrips, setTotalTrips] = useState(0);
  
  // State for filtering and sorting
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [sortBy, setSortBy] = useState('startTime');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // State for filter panel visibility
  const [showFilters, setShowFilters] = useState(false);
  
  // Stats for trips
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  });
  
  // Fetch trips on component mount and when filters/pagination change
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare query parameters
        const params = {
          page: page + 1, // API uses 1-based indexing
          limit: rowsPerPage,
          sortBy,
          sortOrder,
          ...filters
        };
        
        // Remove empty filters
        Object.keys(params).forEach(key => {
          if (params[key] === '') {
            delete params[key];
          }
        });
        
        // Fetch trips
        const response = await tripService.getTrips(params, token);
        
        setTrips(response.data.trips || []);
        setTotalTrips(response.data.totalCount || 0);
        
        // Fetch trip stats
        const statsResponse = await tripService.getTripStats(token);
        setStats(statsResponse.data.stats || {
          total: 0,
          scheduled: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0
        });
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to load trips. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchTrips();
    }
  }, [token, page, rowsPerPage, sortBy, sortOrder, filters]);
  
  /**
   * Handle page change
   * @param {Object} event - Event object
   * @param {Number} newPage - New page number
   */
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  /**
   * Handle rows per page change
   * @param {Object} event - Event object
   */
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  /**
   * Handle filter change
   * @param {Object} event - Event object
   */
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0); // Reset to first page when filters change
  };
  
  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    setPage(0);
  };
  
  /**
   * Handle sort change
   * @param {String} field - Field to sort by
   */
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
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
        return <Chip icon={<CompletedIcon />} label="Completed" size="small" color="success" />;
      case 'cancelled':
        return <Chip icon={<CancelledIcon />} label="Cancelled" size="small" color="error" />;
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
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Navigate to trip detail page
   * @param {String} id - Trip ID
   */
  const handleViewTrip = (id) => {
    navigate(`/trips/${id}`);
  };
  
  /**
   * Navigate to trip edit page
   * @param {String} id - Trip ID
   * @param {Object} event - Event object
   */
  const handleEditTrip = (id, event) => {
    event.stopPropagation();
    navigate(`/trips/edit/${id}`);
  };
  
  /**
   * Delete trip
   * @param {String} id - Trip ID
   * @param {Object} event - Event object
   */
  const handleDeleteTrip = async (id, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await tripService.deleteTrip(id, token);
        // Refresh trip list
        const updatedTrips = trips.filter(trip => trip._id !== id);
        setTrips(updatedTrips);
        setTotalTrips(prev => prev - 1);
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      } catch (err) {
        console.error('Error deleting trip:', err);
        alert('Failed to delete trip. Please try again.');
      }
    }
  };
  
  // Show loading state
  if (loading && trips.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Check if user has permission to create trips
  const canCreateTrip = user?.role === ROLES.ADMIN || user?.role === ROLES.DISPATCHER;
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Trip Management
        </Typography>
        {canCreateTrip && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/trips/new')}
          >
            Create Trip
          </Button>
        )}
      </Box>
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Trips</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Scheduled</Typography>
              <Typography variant="h4" color="info.main">{stats.scheduled}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>In Progress</Typography>
              <Typography variant="h4" color="warning.main">{stats.in_progress}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Completed</Typography>
              <Typography variant="h4" color="success.main">{stats.completed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Cancelled</Typography>
              <Typography variant="h4" color="error.main">{stats.cancelled}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Search and filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by origin, destination, driver name..."
              variant="outlined"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Date Filters'}
              </Button>
              {(filters.search || filters.status || filters.startDate || filters.endDate) && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearFilters}
                >
                  <ClearIcon />
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
        
        {/* Advanced filters */}
        {showFilters && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  id="startDate"
                  name="startDate"
                  label="Start Date"
                  type="date"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  id="endDate"
                  name="endDate"
                  label="End Date"
                  type="date"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* Trips table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSortChange('origin')}
                  sx={{ cursor: 'pointer' }}
                >
                  Origin
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('destination')}
                  sx={{ cursor: 'pointer' }}
                >
                  Destination
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('driver')}
                  sx={{ cursor: 'pointer' }}
                >
                  Driver
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('vehicle')}
                  sx={{ cursor: 'pointer' }}
                >
                  Vehicle
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('startTime')}
                  sx={{ cursor: 'pointer' }}
                >
                  Start Time
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('status')}
                  sx={{ cursor: 'pointer' }}
                >
                  Status
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trips.length > 0 ? (
                trips.map((trip) => (
                  <TableRow 
                    key={trip._id} 
                    hover 
                    onClick={() => handleViewTrip(trip._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{trip.origin}</TableCell>
                    <TableCell>{trip.destination}</TableCell>
                    <TableCell>
                      {trip.driver ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }} />
                          <Typography variant="body2">
                            {trip.driver.name || `${trip.driver.firstName} ${trip.driver.lastName}`}
                          </Typography>
                        </Box>
                      ) : 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      {trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model} (${trip.vehicle.licensePlate})` : 'Unassigned'}
                    </TableCell>
                    <TableCell>{formatDate(trip.startTime)}</TableCell>
                    <TableCell>{getStatusChip(trip.status)}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleViewTrip(trip._id)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                      {canCreateTrip && (
                        <>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleEditTrip(trip._id, e)}
                            color="primary"
                            disabled={trip.status === 'completed' || trip.status === 'cancelled'}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleDeleteTrip(trip._id, e)}
                            color="error"
                            disabled={trip.status === 'in_progress'}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No trips found
                      </Typography>
                      {canCreateTrip && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          startIcon={<AddIcon />}
                          onClick={() => navigate('/trips/new')}
                          sx={{ mt: 2 }}
                        >
                          Create Trip
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalTrips}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default TripList;
