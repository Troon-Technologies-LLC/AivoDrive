/**
 * Vehicle Action Menu Component
 * Reusable component for vehicle action menus in the vehicle list
 */

import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalGasStation as FuelIcon,
  Build as MaintenanceIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

/**
 * VehicleActionMenu component for displaying action menu for vehicles
 * @param {Object} props - Component props
 * @param {String} props.vehicleId - Vehicle ID
 * @param {Function} props.onView - View action handler
 * @param {Function} props.onEdit - Edit action handler
 * @param {Function} props.onDelete - Delete action handler
 * @returns {JSX.Element} VehicleActionMenu component
 */
const VehicleActionMenu = ({ vehicleId, onView, onEdit, onDelete }) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleAction = (action, event) => {
    event.stopPropagation();
    handleClose();
    action(event);
  };
  
  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{ color: 'text.secondary' }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={(e) => handleAction(onView, e)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" sx={{ color: '#2196f3' }} />
          </ListItemIcon>
          <Typography variant="body2">View Details</Typography>
        </MenuItem>
        
        {user?.role === ROLES.ADMIN && (
          <>
            <MenuItem onClick={(e) => handleAction(onEdit, e)}>
              <ListItemIcon>
                <EditIcon fontSize="small" sx={{ color: '#4caf50' }} />
              </ListItemIcon>
              <Typography variant="body2">Edit Vehicle</Typography>
            </MenuItem>
            
            <MenuItem onClick={(e) => handleAction(onDelete, e)}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" sx={{ color: '#f44336' }} />
              </ListItemIcon>
              <Typography variant="body2">Delete Vehicle</Typography>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={(e) => handleAction(() => {}, e)}>
              <ListItemIcon>
                <FuelIcon fontSize="small" sx={{ color: '#26a69a' }} />
              </ListItemIcon>
              <Typography variant="body2">Add Fuel Record</Typography>
            </MenuItem>
            
            <MenuItem onClick={(e) => handleAction(() => {}, e)}>
              <ListItemIcon>
                <MaintenanceIcon fontSize="small" sx={{ color: '#ff9800' }} />
              </ListItemIcon>
              <Typography variant="body2">Schedule Maintenance</Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default VehicleActionMenu;
