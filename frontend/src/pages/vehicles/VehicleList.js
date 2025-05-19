/**
 * Vehicle List Page
 * Displays a list of all vehicles with filtering, sorting, and pagination
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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
  Menu,
  ListItemIcon
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  DirectionsCar as CarIcon,
  MoreVert as MoreVertIcon,
  LocalGasStation as FuelIcon,
  Build as MaintenanceIcon,
  Block as InactiveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import vehicleService from '../../services/vehicleService';
import { ROLES } from '../../constants/roles';
import SummaryCard from '../../components/common/SummaryCard';
import VehicleActionMenu from '../../components/vehicles/VehicleActionMenu';

/**
 * Vehicle List component with filtering, sorting, and pagination
 * @returns {JSX.Element} Vehicle List page
 */
const VehicleList = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // State for vehicles data
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalVehicles, setTotalVehicles] = useState(0);
  
  // State for filtering and sorting
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    make: ''
  });
  const [sortBy, setSortBy] = useState('registrationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // State for filter panel visibility
  const [showFilters, setShowFilters] = useState(false);
  
  // Stats for vehicles
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    inactive: 0
  });
  
  // Fetch vehicles on component mount and when filters/pagination change
  useEffect(() => {
    const fetchVehicles = async () => {
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
        
        // Fetch vehicles
        const response = await vehicleService.getVehicles(params, token);
        console.log('Vehicle response:', response);
        
        // Check different possible response structures
        if (response.data && Array.isArray(response.data)) {
          setVehicles(response.data);
          setTotalVehicles(response.data.length);
        } else if (response.data && response.data.vehicles) {
          setVehicles(response.data.vehicles);
          setTotalVehicles(response.data.totalCount || response.data.vehicles.length);
        } else if (response.vehicles) {
          setVehicles(response.vehicles);
          setTotalVehicles(response.totalCount || response.vehicles.length);
        } else {
          setVehicles([]);
          setTotalVehicles(0);
          console.error('Unexpected response structure:', response);
        }
        
        // Fetch vehicle stats
        const statsResponse = await vehicleService.getVehicleStats(token);
        console.log('Stats response:', statsResponse);
        
        // Handle different response structures and properly extract stats
        let vehicleStats;
        if (statsResponse.data && statsResponse.data.stats) {
          vehicleStats = statsResponse.data.stats;
        } else if (statsResponse.stats) {
          vehicleStats = statsResponse.stats;
        } else {
          vehicleStats = {
            total: 0,
            byStatus: {}
          };
        }
        
        // Extract status counts with proper defaults
        const byStatus = vehicleStats.byStatus || {};
        
        setStats({
          total: vehicleStats.total || 0,
          active: byStatus['active'] || 0,
          maintenance: byStatus['maintenance'] || 0,
          inactive: byStatus['inactive'] || 0
        });
        
        console.log('Processed stats:', {
          total: vehicleStats.total || 0,
          active: byStatus['active'] || 0,
          maintenance: byStatus['maintenance'] || 0,
          inactive: byStatus['inactive'] || 0
        });
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicles. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchVehicles();
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
      type: '',
      make: ''
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
   * Get status chip for vehicle status
   * @param {String} status - Vehicle status
   * @returns {JSX.Element} Status chip
   */
  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" size="small" color="success" />;
      case 'maintenance':
        return <Chip label="Maintenance" size="small" color="warning" />;
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
   * Navigate to vehicle detail page
   * @param {String} id - Vehicle ID
   */
  const handleViewVehicle = (id) => {
    navigate(`/vehicles/${id}`);
  };
  
  /**
   * Navigate to vehicle edit page
   * @param {String} id - Vehicle ID
   * @param {Object} event - Event object
   */
  const handleEditVehicle = (id, event) => {
    event.stopPropagation();
    navigate(`/vehicles/edit/${id}`);
  };
  
  /**
   * Delete vehicle
   * @param {String} id - Vehicle ID
   * @param {Object} event - Event object
   */
  const handleDeleteVehicle = async (id, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.deleteVehicle(id, token);
        // Refresh vehicle list
        const updatedVehicles = vehicles.filter(vehicle => vehicle._id !== id);
        setVehicles(updatedVehicles);
        setTotalVehicles(prev => prev - 1);
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        alert('Failed to delete vehicle. Please try again.');
      }
    }
  };
  
  // Show loading state
  if (loading && vehicles.length === 0) {
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
          Vehicle Management
        </Typography>
        {user?.role === ROLES.ADMIN && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/vehicles/new')}
          >
            Add Vehicle
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
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Vehicles"
            value={stats.total}
            icon={<Avatar sx={{ bgcolor: 'rgba(33, 150, 243, 0.2)', width: 40, height: 40 }}>
              <CarIcon sx={{ color: '#2196f3' }} />
            </Avatar>}
            sx={{ borderLeft: '4px solid #2196f3' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Active Vehicles"
            value={stats.active}
            icon={<Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.2)', width: 40, height: 40 }}>
              <CarIcon sx={{ color: '#4caf50' }} />
            </Avatar>}
            sx={{ borderLeft: '4px solid #4caf50' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="In Maintenance"
            value={stats.maintenance}
            icon={<Avatar sx={{ bgcolor: 'rgba(255, 152, 0, 0.2)', width: 40, height: 40 }}>
              <MaintenanceIcon sx={{ color: '#ff9800' }} />
            </Avatar>}
            sx={{ borderLeft: '4px solid #ff9800' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Inactive Vehicles"
            value={stats.inactive}
            icon={<Avatar sx={{ bgcolor: 'rgba(244, 67, 54, 0.2)', width: 40, height: 40 }}>
              <InactiveIcon sx={{ color: '#f44336' }} />
            </Avatar>}
            sx={{ borderLeft: '4px solid #f44336' }}
          />
        </Grid>
      </Grid>
      
      {/* Search and filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by license plate, make, model..."
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
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                label="Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="sedan">Sedan</MenuItem>
                <MenuItem value="suv">SUV</MenuItem>
                <MenuItem value="truck">Truck</MenuItem>
                <MenuItem value="van">Van</MenuItem>
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
              {(filters.search || filters.status || filters.type || filters.make) && (
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
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Make</InputLabel>
                  <Select
                    name="make"
                    value={filters.make}
                    onChange={handleFilterChange}
                    label="Make"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Toyota">Toyota</MenuItem>
                    <MenuItem value="Honda">Honda</MenuItem>
                    <MenuItem value="Ford">Ford</MenuItem>
                    <MenuItem value="Chevrolet">Chevrolet</MenuItem>
                    <MenuItem value="Nissan">Nissan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* Vehicles table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSortChange('licensePlate')}
                  sx={{ cursor: 'pointer' }}
                >
                  License Plate
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('make')}
                  sx={{ cursor: 'pointer' }}
                >
                  Make/Model
                </TableCell>

                <TableCell 
                  onClick={() => handleSortChange('status')}
                  sx={{ cursor: 'pointer' }}
                >
                  Status
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('registrationDate')}
                  sx={{ cursor: 'pointer' }}
                >
                  Registration Date
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('lastMaintenanceDate')}
                  sx={{ cursor: 'pointer' }}
                >
                  Last Maintenance
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <TableRow 
                    key={vehicle._id} 
                    hover 
                    onClick={() => handleViewVehicle(vehicle._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CarIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2" fontWeight="medium">
                          {vehicle.licensePlate}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{`${vehicle.make} ${vehicle.model}`}</TableCell>
                    <TableCell>{getStatusChip(vehicle.status)}</TableCell>
                    <TableCell>{formatDate(vehicle.registrationDate)}</TableCell>
                    <TableCell>{formatDate(vehicle.lastMaintenanceDate)}</TableCell>
                    <TableCell align="right">
                      <VehicleActionMenu
                        vehicleId={vehicle._id}
                        onView={() => handleViewVehicle(vehicle._id)}
                        onEdit={(e) => handleEditVehicle(vehicle._id, e)}
                        onDelete={(e) => handleDeleteVehicle(vehicle._id, e)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No vehicles found
                      </Typography>
                      {user?.role === ROLES.ADMIN && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          startIcon={<AddIcon />}
                          onClick={() => navigate('/vehicles/new')}
                          sx={{ mt: 2 }}
                        >
                          Add Vehicle
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
          count={totalVehicles}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default VehicleList;
