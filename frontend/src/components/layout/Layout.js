/**
 * Main Layout Component
 * Provides the application layout with sidebar, header, and content area
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Layout component that wraps the main application content
 * @returns {JSX.Element} Layout component with sidebar, header, and content area
 */
const Layout = () => {
  // State for sidebar open/closed on mobile
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // State for sidebar collapsed/expanded on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Toggle sidebar on mobile
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Toggle sidebar collapsed state on desktop
  const handleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Sidebar width based on collapsed state
  const drawerWidth = sidebarCollapsed ? 72 : 260;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      
      {/* Header */}
      <Header 
        drawerWidth={drawerWidth} 
        onDrawerToggle={handleDrawerToggle} 
        onSidebarCollapse={handleSidebarCollapse} 
        sidebarCollapsed={sidebarCollapsed} 
      />
      
      {/* Sidebar */}
      <Sidebar 
        drawerWidth={drawerWidth} 
        mobileOpen={mobileOpen} 
        onDrawerToggle={handleDrawerToggle} 
        collapsed={sidebarCollapsed}
      />
      
      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: 0 },
          mt: '64px', // Header height
          overflow: 'auto',
          transition: theme => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
