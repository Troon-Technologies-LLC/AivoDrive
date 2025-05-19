/**
 * Sidebar Component
 * Navigation sidebar with links to different sections of the application
 * Updated to support both full and collapsed states
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DirectionsCar as VehicleIcon,
  Person as DriverIcon,
  Map as TripIcon,
  Build as MaintenanceIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

/**
 * Sidebar component with navigation links
 * @param {Object} props - Component props
 * @param {Number} props.drawerWidth - Width of the sidebar drawer
 * @param {Boolean} props.mobileOpen - Whether the mobile drawer is open
 * @param {Function} props.onDrawerToggle - Function to toggle drawer
 * @param {Boolean} props.collapsed - Whether the sidebar is in collapsed state
 * @returns {JSX.Element} Sidebar component
 */
const Sidebar = ({ drawerWidth, mobileOpen, onDrawerToggle, collapsed }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Navigation items with access control
  const navItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: [ROLES.ADMIN, ROLES.DISPATCHER, ROLES.DRIVER], // All roles can access
    },
    {
      text: 'Vehicles',
      icon: <VehicleIcon />,
      path: '/vehicles',
      roles: [ROLES.ADMIN], // Admin only
    },
    {
      text: 'Drivers',
      icon: <DriverIcon />,
      path: '/drivers',
      roles: [ROLES.ADMIN], // Admin only
    },
    {
      text: 'Trips',
      icon: <TripIcon />,
      path: '/trips',
      roles: [ROLES.ADMIN, ROLES.DISPATCHER, ROLES.DRIVER], // All roles can access
    },
    {
      text: 'Maintenance',
      icon: <MaintenanceIcon />,
      path: '/maintenance',
      roles: [ROLES.ADMIN], // Admin only
    },
    {
      text: 'Reports',
      icon: <ReportIcon />,
      path: '/reports',
      roles: [ROLES.ADMIN], // Admin only
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      roles: [ROLES.ADMIN, ROLES.DISPATCHER, ROLES.DRIVER], // All roles can access
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  // Drawer content for full sidebar
  const drawerContent = (
    <div>
      {/* Logo and app name */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          p: 2,
          height: '64px', // Match header height
          overflow: 'hidden',
        }}
      >
        {!collapsed && (
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              color: 'primary.main',
              whiteSpace: 'nowrap',
            }}
          >
            AivoDrive
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Navigation links */}
      <List>
        {filteredNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Tooltip title={collapsed ? item.text : ""} placement="right" arrow>
              <ListItemButton
                selected={location.pathname.startsWith(item.path)}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    onDrawerToggle();
                  }
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2.5,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(77, 182, 172, 0.1)',
                    borderRight: '3px solid',
                    borderColor: 'primary.main',
                  },
                  '&.Mui-selected:hover': {
                    bgcolor: 'rgba(77, 182, 172, 0.2)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 'auto' : 3,
                    justifyContent: 'center',
                    color: location.pathname.startsWith(item.path)
                      ? 'primary.main'
                      : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* User role display - only shown when not collapsed */}
      {!collapsed && (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Role: {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
          </Typography>
        </Box>
      )}
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { sm: drawerWidth }, 
        flexShrink: { sm: 0 },
      }}
      aria-label="navigation sidebar"
    >
      {/* Mobile drawer (temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'background.paper',
            overflowX: 'hidden',
            transition: theme => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer (permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            overflowX: 'hidden',
            transition: theme => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            whiteSpace: 'nowrap',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
