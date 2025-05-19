/**
 * Notifications Page
 * Displays system notifications and alerts for the user
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Badge,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NewIcon,
  NotificationsOff as ReadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  DirectionsCar as VehicleIcon,
  Person as DriverIcon,
  Route as TripIcon,
  Build as MaintenanceIcon,
  LocalGasStation as FuelIcon,
  Warning as AlertIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  DeleteSweep as ClearAllIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Notifications component to display system notifications and alerts
 * @returns {JSX.Element} Notifications page
 */
const Notifications = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  // State for notifications data
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for notification tabs
  const [activeTab, setActiveTab] = useState(0);
  
  // State for action menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  // State for confirmation dialog
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  
  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, this would be an API call to fetch notifications
        // For now, we'll use mock data
        setTimeout(() => {
          setNotifications(mockNotifications);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again.');
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [token]);
  
  /**
   * Handle tab change
   * @param {Object} event - Event object
   * @param {Number} newValue - New tab index
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  /**
   * Open action menu for a notification
   * @param {Object} event - Event object
   * @param {Object} notification - Notification object
   */
  const handleMenuOpen = (event, notification) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };
  
  /**
   * Close action menu
   */
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNotification(null);
  };
  
  /**
   * Mark notification as read
   * @param {Object} notification - Notification object
   */
  const handleMarkAsRead = (notification) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    handleMenuClose();
  };
  
  /**
   * Delete notification
   * @param {Object} notification - Notification object
   */
  const handleDeleteNotification = (notification) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(n => n.id !== notification.id)
    );
    handleMenuClose();
  };
  
  /**
   * Clear all notifications
   */
  const handleClearAll = () => {
    if (activeTab === 0) {
      setNotifications([]);
    } else if (activeTab === 1) {
      setNotifications(prevNotifications =>
        prevNotifications.filter(n => n.read)
      );
    } else if (activeTab === 2) {
      setNotifications(prevNotifications =>
        prevNotifications.filter(n => !n.read)
      );
    }
    setClearDialogOpen(false);
  };
  
  /**
   * Navigate to related content
   * @param {Object} notification - Notification object
   */
  const handleNavigateToContent = (notification) => {
    if (!notification.link) return;
    
    // Mark as read before navigating
    handleMarkAsRead(notification);
    
    // Navigate to the related content
    navigate(notification.link);
  };
  
  /**
   * Get icon for notification type
   * @param {String} type - Notification type
   * @returns {JSX.Element} Icon component
   */
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'vehicle':
        return <VehicleIcon />;
      case 'driver':
        return <DriverIcon />;
      case 'trip':
        return <TripIcon />;
      case 'maintenance':
        return <MaintenanceIcon />;
      case 'fuel':
        return <FuelIcon />;
      case 'alert':
        return <AlertIcon />;
      case 'info':
      default:
        return <InfoIcon />;
    }
  };
  
  /**
   * Get color for notification priority
   * @param {String} priority - Notification priority
   * @returns {String} Color
   */
  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
      default:
        return 'info';
    }
  };
  
  /**
   * Format date to readable format
   * @param {String} dateString - Date string
   * @returns {String} Formatted date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 0) return true; // All notifications
    if (activeTab === 1) return notification.read; // Read notifications
    if (activeTab === 2) return !notification.read; // Unread notifications
    return true;
  });
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      type: 'maintenance',
      title: 'Maintenance Due',
      message: 'Vehicle ABC123 is due for maintenance in 3 days.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      read: false,
      priority: 'high',
      link: '/vehicles/1'
    },
    {
      id: 2,
      type: 'trip',
      title: 'Trip Completed',
      message: 'Trip #12345 has been marked as completed by driver John Doe.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: true,
      priority: 'low',
      link: '/trips/12345'
    },
    {
      id: 3,
      type: 'fuel',
      title: 'Fuel Record Added',
      message: 'A new fuel record has been added for vehicle XYZ789.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      read: false,
      priority: 'medium',
      link: '/vehicles/2'
    },
    {
      id: 4,
      type: 'driver',
      title: 'Driver License Expiring',
      message: 'Driver Jane Smith\'s license will expire in 15 days.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      read: false,
      priority: 'high',
      link: '/drivers/1'
    },
    {
      id: 5,
      type: 'vehicle',
      title: 'Vehicle Added',
      message: 'A new vehicle (Ford F-150, License: DEF456) has been added to the fleet.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      read: true,
      priority: 'low',
      link: '/vehicles/3'
    },
    {
      id: 6,
      type: 'alert',
      title: 'System Maintenance',
      message: 'The system will undergo maintenance on Sunday, May 20, 2025, from 2:00 AM to 4:00 AM EST.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      read: false,
      priority: 'medium',
      link: null
    },
    {
      id: 7,
      type: 'info',
      title: 'New Feature Available',
      message: 'A new reporting feature has been added. Check it out in the Reports section!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      read: true,
      priority: 'low',
      link: '/reports'
    }
  ];
  
  // Show loading state
  if (loading) {
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
          Notifications
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<ClearAllIcon />}
          onClick={() => setClearDialogOpen(true)}
          disabled={filteredNotifications.length === 0}
        >
          Clear All
        </Button>
      </Box>
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Notification tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="All" 
            icon={
              <Badge badgeContent={notifications.length} color="primary">
                <NotificationsIcon />
              </Badge>
            } 
          />
          <Tab 
            label="Read" 
            icon={
              <Badge badgeContent={notifications.filter(n => n.read).length} color="default">
                <ReadIcon />
              </Badge>
            } 
          />
          <Tab 
            label="Unread" 
            icon={
              <Badge badgeContent={unreadCount} color="error">
                <NewIcon />
              </Badge>
            } 
          />
        </Tabs>
        
        {/* Notifications list */}
        <List sx={{ p: 0 }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                    cursor: notification.link ? 'pointer' : 'default'
                  }}
                  onClick={() => notification.link && handleNavigateToContent(notification)}
                  secondaryAction={
                    <IconButton edge="end" onClick={(e) => handleMenuOpen(e, notification)}>
                      <MoreIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${getNotificationColor(notification.priority)}.main` }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" component="span">
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip 
                            label="New" 
                            size="small" 
                            color="error" 
                            sx={{ height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          component="span"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="span"
                        >
                          {formatDate(notification.timestamp)}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeTab === 0
                  ? 'You don\'t have any notifications yet.'
                  : activeTab === 1
                  ? 'You don\'t have any read notifications.'
                  : 'You don\'t have any unread notifications.'}
              </Typography>
            </Box>
          )}
        </List>
      </Paper>
      
      {/* Action menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={() => handleMarkAsRead(selectedNotification)}>
            <ListItemIcon>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as read</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDeleteNotification(selectedNotification)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Clear confirmation dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
      >
        <DialogTitle>Clear Notifications</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {activeTab === 0
              ? 'Are you sure you want to clear all notifications?'
              : activeTab === 1
              ? 'Are you sure you want to clear all read notifications?'
              : 'Are you sure you want to clear all unread notifications?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearAll} color="error">Clear</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications;
