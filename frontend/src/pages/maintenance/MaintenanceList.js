/**
 * Maintenance List Page
 * Displays a list of all maintenance records with filtering, sorting, and pagination
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
  Build as MaintenanceIcon,
  CheckCircle as CompletedIcon,
  Schedule as ScheduledIcon,
  PlayArrow as InProgressIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import maintenanceService from '../../services/maintenanceService';
import { ROLES } from '../../constants/roles';

/**
 * Maintenance List component with filtering, sorting, and pagination
 * @returns {JSX.Element} Maintenance List page
 */
const MaintenanceList = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // State for maintenance records data
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // State for filtering and sorting
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    maintenanceType: '',
    startDate: '',
    endDate: ''
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // State for filter panel visibility
  const [showFilters, setShowFilters] = useState(false);
  
  // Stats for maintenance records
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0
  });
  
  // Fetch maintenance records on component mount and when filters/pagination change
  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
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
        
        // Fetch maintenance records
        const response = await maintenanceService.getMaintenanceRecords(params, token);
        
        setMaintenanceRecords(response.data.maintenanceRecords || []);
        setTotalRecords(response.data.totalCount || 0);
        
        // Fetch maintenance stats
        const statsResponse = await maintenanceService.getMaintenanceStats(token);
        setStats(statsResponse.data.stats || {
          total: 0,
          scheduled: 0,
          in_progress: 0,
          completed: 0,
          overdue: 0
        });
      } catch (err) {
        console.error('Error fetching maintenance records:', err);
        setError('Failed to load maintenance records. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchMaintenanceRecords();
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
      maintenanceType: '',
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
   * Get status chip for maintenance status
   * @param {String} status - Maintenance status
   * @returns {JSX.Element} Status chip
   */
  const getStatusChip = (status) => {
    switch (status) {
      case 'scheduled':
        return <Chip icon={<ScheduledIcon />} label="Scheduled" size="small" color="info" />;
      case 'in_progress':
        return <Chip icon={<InProgressIcon />} label="In Progress" size="small" color="warning" />;
      case 'completed':
        return <Chip icon={<CompletedIcon />} label="Completed" size="small" color="success" />;
      case 'overdue':
        return <Chip label="Overdue" size="small" color="error" />;
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
   * Format currency
   * @param {Number} amount - Amount
   * @returns {String} Formatted currency
   */
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `$${parseFloat(amount).toFixed(2)}`;
  };
  
  /**
   * Navigate to maintenance detail page
   * @param {String} id - Maintenance ID
   */
  const handleViewMaintenance = (id) => {
    navigate(`/maintenance/${id}`);
  };
  
  /**
   * Navigate to maintenance edit page
   * @param {String} id - Maintenance ID
   * @param {Object} event - Event object
   */
  const handleEditMaintenance = (id, event) => {
    event.stopPropagation();
    navigate(`/maintenance/edit/${id}`);
  };
  
  /**
   * Delete maintenance record
   * @param {String} id - Maintenance ID
   * @param {Object} event - Event object
   */
  const handleDeleteMaintenance = async (id, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        await maintenanceService.deleteMaintenance(id, token);
        // Refresh maintenance list
        const updatedRecords = maintenanceRecords.filter(record => record._id !== id);
        setMaintenanceRecords(updatedRecords);
        setTotalRecords(prev => prev - 1);
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      } catch (err) {
        console.error('Error deleting maintenance record:', err);
        alert('Failed to delete maintenance record. Please try again.');
      }
    }
  };
  
  // Show loading state
  if (loading && maintenanceRecords.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Check if user has permission to create maintenance records
  const canCreateMaintenance = user?.role === ROLES.ADMIN;
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Maintenance Management
        </Typography>
        {canCreateMaintenance && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/maintenance/new')}
          >
            Schedule Maintenance
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
              <Typography color="text.secondary" gutterBottom>Total Records</Typography>
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
              <Typography color="text.secondary" gutterBottom>Overdue</Typography>
              <Typography variant="h4" color="error.main">{stats.overdue}</Typography>
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
              placeholder="Search by vehicle, description..."
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
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Maintenance Type</InputLabel>
              <Select
                name="maintenanceType"
                value={filters.maintenanceType}
                onChange={handleFilterChange}
                label="Maintenance Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="routine">Routine</MenuItem>
                <MenuItem value="repair">Repair</MenuItem>
                <MenuItem value="inspection">Inspection</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
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
                {showFilters ? 'Hide Filters' : 'Date Filters'}
              </Button>
              {(filters.search || filters.status || filters.maintenanceType || filters.startDate || filters.endDate) && (
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
      
      {/* Maintenance records table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSortChange('vehicle')}
                  sx={{ cursor: 'pointer' }}
                >
                  Vehicle
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('maintenanceType')}
                  sx={{ cursor: 'pointer' }}
                >
                  Type
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('description')}
                  sx={{ cursor: 'pointer' }}
                >
                  Description
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('date')}
                  sx={{ cursor: 'pointer' }}
                >
                  Date
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('cost')}
                  sx={{ cursor: 'pointer' }}
                >
                  Cost
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
              {maintenanceRecords.length > 0 ? (
                maintenanceRecords.map((record) => (
                  <TableRow 
                    key={record._id} 
                    hover 
                    onClick={() => handleViewMaintenance(record._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      {record.vehicle ? `${record.vehicle.make} ${record.vehicle.model} (${record.vehicle.licensePlate})` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={<MaintenanceIcon />} 
                        label={record.maintenanceType.charAt(0).toUpperCase() + record.maintenanceType.slice(1)} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>{formatCurrency(record.cost)}</TableCell>
                    <TableCell>{getStatusChip(record.status)}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleViewMaintenance(record._id)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                      {canCreateMaintenance && (
                        <>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleEditMaintenance(record._id, e)}
                            color="primary"
                            disabled={record.status === 'completed'}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleDeleteMaintenance(record._id, e)}
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
                        No maintenance records found
                      </Typography>
                      {canCreateMaintenance && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          startIcon={<AddIcon />}
                          onClick={() => navigate('/maintenance/new')}
                          sx={{ mt: 2 }}
                        >
                          Schedule Maintenance
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

export default MaintenanceList;
