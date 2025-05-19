/**
 * Fuel List Page
 * Displays a list of all fuel records with filtering, sorting, and pagination
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
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  LocalGasStation as FuelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import fuelService from '../../services/fuelService';
import { ROLES } from '../../constants/roles';

/**
 * Fuel List component with filtering, sorting, and pagination
 * @returns {JSX.Element} Fuel List page
 */
const FuelList = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // State for fuel records data
  const [fuelRecords, setFuelRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // State for filtering and sorting
  const [filters, setFilters] = useState({
    search: '',
    vehicleId: '',
    startDate: '',
    endDate: ''
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // State for filter panel visibility
  const [showFilters, setShowFilters] = useState(false);
  
  // Stats for fuel records
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalFuelCost: 0,
    totalFuelAmount: 0,
    averageFuelPrice: 0,
    averageFuelEfficiency: 0
  });
  
  // Fetch fuel records on component mount and when filters/pagination change
  useEffect(() => {
    const fetchFuelRecords = async () => {
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
        
        // Fetch fuel records
        const response = await fuelService.getFuelRecords(params, token);
        
        setFuelRecords(response.data.fuelRecords || []);
        setTotalRecords(response.data.totalCount || 0);
        
        // Fetch fuel stats
        const statsResponse = await fuelService.getFuelStats(token);
        setStats(statsResponse.data.stats || {
          totalRecords: 0,
          totalFuelCost: 0,
          totalFuelAmount: 0,
          averageFuelPrice: 0,
          averageFuelEfficiency: 0
        });
      } catch (err) {
        console.error('Error fetching fuel records:', err);
        setError('Failed to load fuel records. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchFuelRecords();
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
      vehicleId: '',
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
   * Format fuel amount
   * @param {Number} amount - Amount
   * @returns {String} Formatted fuel amount
   */
  const formatFuelAmount = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `${parseFloat(amount).toFixed(2)} L`;
  };
  
  /**
   * Format fuel efficiency
   * @param {Number} efficiency - Fuel efficiency
   * @returns {String} Formatted fuel efficiency
   */
  const formatFuelEfficiency = (efficiency) => {
    if (efficiency === null || efficiency === undefined) return 'N/A';
    return `${parseFloat(efficiency).toFixed(2)} km/L`;
  };
  
  /**
   * Navigate to fuel detail page
   * @param {String} id - Fuel ID
   */
  const handleViewFuel = (id) => {
    navigate(`/fuel/${id}`);
  };
  
  /**
   * Navigate to fuel edit page
   * @param {String} id - Fuel ID
   * @param {Object} event - Event object
   */
  const handleEditFuel = (id, event) => {
    event.stopPropagation();
    navigate(`/fuel/edit/${id}`);
  };
  
  /**
   * Delete fuel record
   * @param {String} id - Fuel ID
   * @param {Object} event - Event object
   */
  const handleDeleteFuel = async (id, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this fuel record?')) {
      try {
        await fuelService.deleteFuel(id, token);
        // Refresh fuel list
        const updatedRecords = fuelRecords.filter(record => record._id !== id);
        setFuelRecords(updatedRecords);
        setTotalRecords(prev => prev - 1);
        // Update stats
        setStats(prev => ({
          ...prev,
          totalRecords: prev.totalRecords - 1
        }));
      } catch (err) {
        console.error('Error deleting fuel record:', err);
        alert('Failed to delete fuel record. Please try again.');
      }
    }
  };
  
  // Show loading state
  if (loading && fuelRecords.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Check if user has permission to create fuel records
  const canCreateFuel = user?.role === ROLES.ADMIN || user?.role === ROLES.DISPATCHER;
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Fuel Management
        </Typography>
        {canCreateFuel && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/fuel/new')}
          >
            Add Fuel Record
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
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Records</Typography>
              <Typography variant="h4">{stats.totalRecords}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Fuel Cost</Typography>
              <Typography variant="h4">{formatCurrency(stats.totalFuelCost)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Fuel</Typography>
              <Typography variant="h4">{formatFuelAmount(stats.totalFuelAmount)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Avg. Fuel Price</Typography>
              <Typography variant="h4">{formatCurrency(stats.averageFuelPrice)}/L</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Avg. Fuel Efficiency</Typography>
              <Typography variant="h4">{formatFuelEfficiency(stats.averageFuelEfficiency)}</Typography>
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
              placeholder="Search by vehicle, station..."
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
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Date Filters'}
              </Button>
              {(filters.search || filters.vehicleId || filters.startDate || filters.endDate) && (
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
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/fuel/new')}
              disabled={!canCreateFuel}
            >
              Add Record
            </Button>
          </Grid>
        </Grid>
        
        {/* Advanced filters */}
        {showFilters && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
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
              <Grid item xs={12} sm={6} md={4}>
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
      
      {/* Fuel records table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSortChange('date')}
                  sx={{ cursor: 'pointer' }}
                >
                  Date
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('vehicle')}
                  sx={{ cursor: 'pointer' }}
                >
                  Vehicle
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('fuelAmount')}
                  sx={{ cursor: 'pointer' }}
                >
                  Fuel Amount
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('fuelPrice')}
                  sx={{ cursor: 'pointer' }}
                >
                  Price per Liter
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('totalCost')}
                  sx={{ cursor: 'pointer' }}
                >
                  Total Cost
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('odometer')}
                  sx={{ cursor: 'pointer' }}
                >
                  Odometer
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fuelRecords.length > 0 ? (
                fuelRecords.map((record) => (
                  <TableRow 
                    key={record._id} 
                    hover 
                    onClick={() => handleViewFuel(record._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>
                      {record.vehicle ? `${record.vehicle.make} ${record.vehicle.model} (${record.vehicle.licensePlate})` : 'N/A'}
                    </TableCell>
                    <TableCell>{formatFuelAmount(record.fuelAmount)}</TableCell>
                    <TableCell>{formatCurrency(record.fuelPrice)}</TableCell>
                    <TableCell>{formatCurrency(record.totalCost)}</TableCell>
                    <TableCell>{record.odometer ? `${record.odometer} km` : 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleViewFuel(record._id)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                      {canCreateFuel && (
                        <>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleEditFuel(record._id, e)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleDeleteFuel(record._id, e)}
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
                        No fuel records found
                      </Typography>
                      {canCreateFuel && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          startIcon={<AddIcon />}
                          onClick={() => navigate('/fuel/new')}
                          sx={{ mt: 2 }}
                        >
                          Add Fuel Record
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
          count={totalRecords}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default FuelList;
