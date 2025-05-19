/**
 * Main App component for AivoDrive
 * Handles routing and application layout
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Authentication pages
import Login from './pages/auth/Login';

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';

// Vehicle management pages
import VehicleList from './pages/vehicles/VehicleList';
import VehicleDetail from './pages/vehicles/VehicleDetail';
import VehicleForm from './pages/vehicles/VehicleForm';

// Driver management pages
import DriverList from './pages/drivers/DriverList';
import DriverDetail from './pages/drivers/DriverDetail';
import DriverForm from './pages/drivers/DriverForm';

// Trip management pages
import TripList from './pages/trips/TripList';
import TripDetail from './pages/trips/TripDetail';
import TripForm from './pages/trips/TripForm';

// Maintenance management pages
import MaintenanceList from './pages/maintenance/MaintenanceList';
import MaintenanceDetail from './pages/maintenance/MaintenanceDetail';
import MaintenanceForm from './pages/maintenance/MaintenanceForm';

// Reports pages
import Reports from './pages/reports/Reports';

// Settings page
import Settings from './pages/settings/Settings';

// Context
import { useAuth } from './context/AuthContext';
import { ROLES } from './constants/roles';

/**
 * Main App component
 * @returns {JSX.Element} The App component
 */
const App = () => {
  const { isAuthenticated, user } = useAuth();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Vehicle Management - Accessible to all users */}
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicles/:id" element={<VehicleDetail />} />
            <Route 
              path="/vehicles/new" 
              element={
                user?.role === ROLES.ADMIN ? 
                <VehicleForm /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/vehicles/edit/:id" 
              element={
                user?.role === ROLES.ADMIN ? 
                <VehicleForm /> : 
                <Navigate to="/dashboard" />
              } 
            />

            {/* Driver Management - Admin only */}
            <Route 
              path="/drivers" 
              element={
                user?.role === ROLES.ADMIN ? 
                <DriverList /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/drivers/:id" 
              element={
                user?.role === ROLES.ADMIN ? 
                <DriverDetail /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/drivers/new" 
              element={
                user?.role === ROLES.ADMIN ? 
                <DriverForm /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/drivers/edit/:id" 
              element={
                user?.role === ROLES.ADMIN ? 
                <DriverForm /> : 
                <Navigate to="/dashboard" />
              } 
            />

            {/* Trip Management - All roles with different access levels */}
            <Route path="/trips" element={<TripList />} />
            <Route path="/trips/:id" element={<TripDetail />} />
            <Route 
              path="/trips/new" 
              element={
                [ROLES.ADMIN, ROLES.DISPATCHER].includes(user?.role) ? 
                <TripForm /> : 
                <Navigate to="/trips" />
              } 
            />
            <Route 
              path="/trips/edit/:id" 
              element={
                [ROLES.ADMIN, ROLES.DISPATCHER].includes(user?.role) ? 
                <TripForm /> : 
                <Navigate to="/trips" />
              } 
            />

            {/* Maintenance Management - Admin only */}
            <Route 
              path="/maintenance" 
              element={
                user?.role === ROLES.ADMIN ? 
                <MaintenanceList /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/maintenance/:id" 
              element={
                user?.role === ROLES.ADMIN ? 
                <MaintenanceDetail /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/maintenance/new" 
              element={
                user?.role === ROLES.ADMIN ? 
                <MaintenanceForm /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/maintenance/edit/:id" 
              element={
                user?.role === ROLES.ADMIN ? 
                <MaintenanceForm /> : 
                <Navigate to="/dashboard" />
              } 
            />

            {/* Reports - Admin only */}
            <Route 
              path="/reports" 
              element={
                user?.role === ROLES.ADMIN ? 
                <Reports /> : 
                <Navigate to="/dashboard" />
              } 
            />

            {/* Settings - All roles */}
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Redirect to dashboard if authenticated, otherwise to login */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } />
        
        {/* Catch all route - redirect to dashboard if authenticated, otherwise to login */}
        <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>

      {/* Toast notifications container */}
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default App;
