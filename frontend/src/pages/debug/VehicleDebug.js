/**
 * Vehicle Debug Page
 * Used to debug vehicle detail API responses
 */

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

/**
 * VehicleDebug component for debugging vehicle API responses
 * @returns {JSX.Element} VehicleDebug component
 */
const VehicleDebug = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch vehicle data directly using axios
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Direct axios call to bypass any service layer transformations
        const axiosResponse = await axios.get(
          `${API_BASE_URL}/vehicles/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Raw API Response:', axiosResponse);
        setResponse(axiosResponse);
      } catch (err) {
        console.error('Error fetching vehicle data:', err);
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };
    
    if (token && id) {
      fetchVehicleData();
    }
  }, [id, token]);
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Vehicle Debug</Typography>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => navigate('/vehicles')}
        >
          Back to Vehicles
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>API Response Structure:</Typography>
          <Box 
            component="pre" 
            sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1, 
              overflow: 'auto',
              maxHeight: '500px'
            }}
          >
            {JSON.stringify(response, null, 2)}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default VehicleDebug;
