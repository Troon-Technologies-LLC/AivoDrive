/**
 * Header Component
 * Top navigation bar with app title, user info, and notifications
 * Updated to be sticky and include hamburger menu toggle for both mobile and desktop
 */

import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Badge, 
  Menu, 
  MenuItem, 
  Divider,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import alertService from '../../services/alertService';

/**
 * Header component with app title, user menu, and notifications
 * @param {Object} props - Component props
 * @param {Number} props.drawerWidth - Width of the sidebar drawer
 * @param {Function} props.onDrawerToggle - Function to toggle sidebar on mobile
 * @param {Function} props.onSidebarCollapse - Function to toggle sidebar collapse on desktop
 * @param {Boolean} props.sidebarCollapsed - Whether the sidebar is collapsed on desktop
 * @returns {JSX.Element} Header component
 */
const Header = ({ drawerWidth, onDrawerToggle, onSidebarCollapse, sidebarCollapsed }) => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for user menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (token) {
          const response = await alertService.getUnreadAlertsCount(token);
          setUnreadCount(response.data.total);
        }
      } catch (error) {
        console.error('Error fetching unread alerts count:', error);
      }
    };
    
    fetchUnreadCount();
    
    // Set up interval to check for new notifications every minute
    const intervalId = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(intervalId);
  }, [token]);
  
  // Handle user menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle user menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle notification menu open
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  // Handle notification menu close
  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };
  
  // Handle profile click
  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/settings');
  };
  
  // Handle logout click
  const handleLogoutClick = () => {
    handleMenuClose();
    logout();
  };
  
  // Handle notifications click
  const handleNotificationsClick = () => {
    handleNotificationMenuClose();
    // For MVP, just show toast that this feature is coming soon
    // In a future version, this would navigate to a notifications page
    alert('Notifications feature coming soon!');
  };
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <AppBar
      position="fixed"
      sx={{
        width: '100%',
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
        borderRadius: 0, // Remove rounded corners
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        {/* Logo and brand for all views */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Hamburger menu - visible on all screen sizes */}
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={isMobile ? onDrawerToggle : onSidebarCollapse}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* App title - shown on all views */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: 'primary.main'
            }}
          >
            <Box component="span">
              AivoDrive
            </Box>
          </Typography>
        </Box>
        
        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton 
            color="inherit" 
            onClick={handleNotificationMenuOpen}
            sx={{ mr: 2 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        
        {/* User menu */}
        <Tooltip title={user?.name || 'User'}>
          <IconButton
            onClick={handleMenuOpen}
            color="inherit"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: 'primary.main',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              {user?.name?.charAt(0) || <AccountCircle />}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Toolbar>
      
      {/* User menu dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 200, mt: 1 }
        }}
      >
        <Box sx={{ py: 1, px: 2 }}>
          <Typography variant="subtitle1" noWrap>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email || ''}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfileClick}>
          <SettingsIcon fontSize="small" sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogoutClick}>
          <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>
      
      {/* Notifications dropdown */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400, mt: 1 }
        }}
      >
        <Box sx={{ py: 1, px: 2 }}>
          <Typography variant="subtitle1">
            Notifications
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleNotificationsClick}>
          <Typography variant="body2" color="text.secondary">
            Notifications feature coming soon!
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
