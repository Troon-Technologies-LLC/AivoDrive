/**
 * Driver List Page
 * Displays a list of all drivers with filtering, sorting, and pagination
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
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import driverService from '../../services/driverService';
import { ROLES } from '../../constants/roles';

/**
 * Driver List component with filtering, sorting, and pagination
 * @returns {JSX.Element} Driver List page
 */
const DriverList = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // State for drivers data
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDrivers, setTotalDrivers] = useState(0);
  
  // State for filtering and sorting
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    licenseType: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // State for filter panel visibility
  const [showFilters, setShowFilters] = useState(false);
  
  // Stats for drivers
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    on_trip: 0,
    off_duty: 0,
    inactive: 0
  });
  
  // Fetch drivers on component mount and when filters/pagination change
  useEffect(() => {
    const fetchDrivers = async () => {
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
        
        // Fetch drivers
        const response = await driverService.getDrivers(params, token);
        
        // Log the response to understand its structure
        console.log('Driver API response:', response);
        
        // Check if the data is in the expected format and extract it
        if (response.data) {
          setDrivers(response.data || []);
          setTotalDrivers(response.pagination?.total || 0);
        }
        
        // Fetch driver stats
        const statsResponse = await driverService.getDriverStats(token);
        console.log('Driver stats response:', statsResponse);
        
        // Extract stats data from the response
        let statsData = {
          total: 0,
          available: 0,
          on_trip: 0,
          off_duty: 0,
          inactive: 0
        };
        
        if (statsResponse.data && statsResponse.data.stats) {
          const responseStats = statsResponse.data.stats;
          statsData = {
            total: responseStats.total || 0,
            available: responseStats.byStatus?.available || 0,
            on_trip: responseStats.byStatus?.on_trip || 0,
            off_duty: responseStats.byStatus?.off_duty || 0,
            inactive: responseStats.byStatus?.inactive || 0
          };
        }
        
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching drivers:', err);
        setError('Failed to load drivers. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchDrivers();
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
      licenseType: ''
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
   * Get status chip for driver status
   * @param {String} status - Driver status
   * @returns {JSX.Element} Status chip
   */
  const getStatusChip = (status) => {
    switch (status) {
      case 'available':
        return <Chip label="Available" size="small" color="success" />;
      case 'on_trip':
        return <Chip label="On Trip" size="small" color="warning" />;
      case 'off_duty':
        return <Chip label="Off Duty" size="small" color="default" />;
      case 'inactive':
        return <Chip label="Inactive" size="small" color="error" />;
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
      day: 'numeric'
    });
  };
  
  /**
   * Navigate to driver detail page
   * @param {String} id - Driver ID
   */
  const handleViewDriver = (id) => {
    navigate(`/drivers/${id}`);
  };
  
  /**
   * Navigate to driver edit page
   * @param {String} id - Driver ID
   * @param {Object} event - Event object
   */
  const handleEditDriver = (id, event) => {
    event.stopPropagation();
    navigate(`/drivers/edit/${id}`);
  };
  
  /**
   * Delete driver
   * @param {String} id - Driver ID
   * @param {Object} event - Event object
   */
  const handleDeleteDriver = async (id, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await driverService.deleteDriver(id, token);
        // Refresh driver list
        const updatedDrivers = drivers.filter(driver => driver._id !== id);
        setDrivers(updatedDrivers);
        setTotalDrivers(prev => prev - 1);
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      } catch (err) {
        console.error('Error deleting driver:', err);
        alert('Failed to delete driver. Please try again.');
      }
    }
  };
  
  // Show loading state
  if (loading && drivers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Driver Management
        </Typography>
        {user?.role === ROLES.ADMIN && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/drivers/new')}
          >
            Add Driver
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
              <Typography color="text.secondary" gutterBottom>Total Drivers</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Available</Typography>
              <Typography variant="h4" color="success.main">{stats.available}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>On Trip</Typography>
              <Typography variant="h4" color="warning.main">{stats.on_trip}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Off Duty</Typography>
              <Typography variant="h4">{stats.off_duty}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Inactive</Typography>
              <Typography variant="h4" color="error.main">{stats.inactive}</Typography>
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
              placeholder="Search by name, email, phone, license number..."
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
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="on_trip">On Trip</MenuItem>
                <MenuItem value="off_duty">Off Duty</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>License Type</InputLabel>
              <Select
                name="licenseType"
                value={filters.licenseType}
                onChange={handleFilterChange}
                label="License Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="A">Class A</MenuItem>
                <MenuItem value="B">Class B</MenuItem>
                <MenuItem value="C">Class C</MenuItem>
                <MenuItem value="D">Class D</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'More Filters'}
              </Button>
              {(filters.search || filters.status || filters.licenseType) && (
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
              {/* Additional filters can be added here */}
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* Drivers table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSortChange('name')}
                  sx={{ cursor: 'pointer' }}
                >
                  Driver Name
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('email')}
                  sx={{ cursor: 'pointer' }}
                >
                  Email
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('phone')}
                  sx={{ cursor: 'pointer' }}
                >
                  Phone
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('licenseNumber')}
                  sx={{ cursor: 'pointer' }}
                >
                  License Number
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('licenseExpiry')}
                  sx={{ cursor: 'pointer' }}
                >
                  License Expiry
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
              {drivers.length > 0 ? (
                drivers.map((driver) => (
                  <TableRow 
                    key={driver._id} 
                    hover 
                    onClick={() => handleViewDriver(driver._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {driver.name || (driver.user ? driver.user.name : 'Unknown Driver')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{driver.email || (driver.user ? driver.user.email : 'N/A')}</TableCell>
                    <TableCell>{driver.phone || (driver.user ? driver.user.phone : 'N/A')}</TableCell>
                    <TableCell>{driver.licenseNumber}</TableCell>
                    <TableCell>{formatDate(driver.licenseExpiry)}</TableCell>
                    <TableCell>{getStatusChip(driver.status)}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleViewDriver(driver._id)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                      {user?.role === ROLES.ADMIN && (
                        <>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleEditDriver(driver._id, e)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleDeleteDriver(driver._id, e)}
                            color="error"
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
                        No drivers found
                      </Typography>
                      {user?.role === ROLES.ADMIN && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          startIcon={<AddIcon />}
                          onClick={() => navigate('/drivers/new')}
                          sx={{ mt: 2 }}
                        >
                          Add Driver
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
          count={totalDrivers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default DriverList;
