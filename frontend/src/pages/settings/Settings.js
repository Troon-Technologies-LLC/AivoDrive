/**
 * Settings Page
 * Allows users to configure application preferences and settings
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as ProfileIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as ThemeIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Refresh as ResetIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

/**
 * Settings component with various configuration options
 * @returns {JSX.Element} Settings page
 */
const Settings = () => {
  const { user, token, updateUser } = useAuth();
  
  // State for active settings tab
  const [activeTab, setActiveTab] = useState(0);
  
  // State for settings data
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      tripUpdates: true,
      maintenanceAlerts: true,
      fuelAlerts: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30
    },
    appearance: {
      darkMode: false,
      compactView: false,
      fontSize: 'medium'
    },
    system: {
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      distanceUnit: 'km',
      fuelEfficiencyUnit: 'km/L',
      currency: 'USD'
    }
  });
  
  // State for loading and error
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // State for confirmation dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
  /**
   * Handle tab change
   * @param {Object} event - Event object
   * @param {Number} newValue - New tab index
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  /**
   * Handle settings change
   * @param {String} section - Settings section
   * @param {String} field - Settings field
   * @param {*} value - New value
   */
  const handleSettingsChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear success message when settings are changed
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };
  
  /**
   * Save settings
   */
  const handleSaveSettings = () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    
    // Simulate API call to save settings
    setTimeout(() => {
      // In a real implementation, this would be an API call to save settings
      setLoading(false);
      setSaveSuccess(true);
      
      // Update user profile if profile settings were changed
      if (activeTab === 0) {
        updateUser({
          ...user,
          name: settings.profile.name,
          email: settings.profile.email,
          phone: settings.profile.phone
        });
      }
    }, 1000);
  };
  
  /**
   * Reset settings to defaults
   */
  const handleResetSettings = () => {
    setResetDialogOpen(false);
    setLoading(true);
    
    // Simulate API call to reset settings
    setTimeout(() => {
      // In a real implementation, this would be an API call to reset settings
      // For now, we'll just reset the current tab's settings to some defaults
      switch (activeTab) {
        case 0: // Profile
          setSettings(prev => ({
            ...prev,
            profile: {
              name: user?.name || '',
              email: user?.email || '',
              phone: user?.phone || ''
            }
          }));
          break;
        case 1: // Notifications
          setSettings(prev => ({
            ...prev,
            notifications: {
              emailNotifications: true,
              pushNotifications: true,
              tripUpdates: true,
              maintenanceAlerts: true,
              fuelAlerts: false
            }
          }));
          break;
        case 2: // Security
          setSettings(prev => ({
            ...prev,
            security: {
              twoFactorAuth: false,
              sessionTimeout: 30
            }
          }));
          break;
        case 3: // Appearance
          setSettings(prev => ({
            ...prev,
            appearance: {
              darkMode: false,
              compactView: false,
              fontSize: 'medium'
            }
          }));
          break;
        case 4: // System
          setSettings(prev => ({
            ...prev,
            system: {
              language: 'en',
              dateFormat: 'MM/DD/YYYY',
              distanceUnit: 'km',
              fuelEfficiencyUnit: 'km/L',
              currency: 'USD'
            }
          }));
          break;
        default:
          break;
      }
      
      setLoading(false);
      setSaveSuccess(true);
    }, 1000);
  };
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
      </Box>
      
      {/* Settings layout */}
      <Grid container spacing={3}>
        {/* Settings tabs */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ mb: { xs: 3, md: 0 } }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              orientation="vertical"
              variant="scrollable"
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              <Tab icon={<ProfileIcon />} label="Profile" />
              <Tab icon={<NotificationsIcon />} label="Notifications" />
              <Tab icon={<SecurityIcon />} label="Security" />
              <Tab icon={<ThemeIcon />} label="Appearance" />
              <Tab icon={<LanguageIcon />} label="System" />
            </Tabs>
          </Paper>
        </Grid>
        
        {/* Settings content */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            {/* Success message */}
            {saveSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Settings saved successfully!
              </Alert>
            )}
            
            {/* Error message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {/* Profile Settings */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Profile Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Manage your personal information and profile settings.
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={settings.profile.name}
                      onChange={(e) => handleSettingsChange('profile', 'name', e.target.value)}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleSettingsChange('profile', 'email', e.target.value)}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={settings.profile.phone}
                      onChange={(e) => handleSettingsChange('profile', 'phone', e.target.value)}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Notification Settings */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Configure how and when you receive notifications.
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Email Notifications" />
                    <Switch
                      edge="end"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleSettingsChange('notifications', 'emailNotifications', e.target.checked)}
                      disabled={loading}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Push Notifications" />
                    <Switch
                      edge="end"
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => handleSettingsChange('notifications', 'pushNotifications', e.target.checked)}
                      disabled={loading}
                    />
                  </ListItem>
                  <Divider sx={{ my: 1 }} />
                  <ListItem>
                    <ListItemText 
                      primary="Trip Updates" 
                      secondary="Receive notifications about trip status changes"
                    />
                    <Switch
                      edge="end"
                      checked={settings.notifications.tripUpdates}
                      onChange={(e) => handleSettingsChange('notifications', 'tripUpdates', e.target.checked)}
                      disabled={loading}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Maintenance Alerts" 
                      secondary="Receive notifications about scheduled maintenance"
                    />
                    <Switch
                      edge="end"
                      checked={settings.notifications.maintenanceAlerts}
                      onChange={(e) => handleSettingsChange('notifications', 'maintenanceAlerts', e.target.checked)}
                      disabled={loading}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Fuel Alerts" 
                      secondary="Receive notifications about low fuel levels"
                    />
                    <Switch
                      edge="end"
                      checked={settings.notifications.fuelAlerts}
                      onChange={(e) => handleSettingsChange('notifications', 'fuelAlerts', e.target.checked)}
                      disabled={loading}
                    />
                  </ListItem>
                </List>
              </Box>
            )}
            
            {/* Security Settings */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Manage your account security and authentication settings.
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Two-Factor Authentication" 
                      secondary="Enable two-factor authentication for additional security"
                    />
                    <Switch
                      edge="end"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleSettingsChange('security', 'twoFactorAuth', e.target.checked)}
                      disabled={loading}
                    />
                  </ListItem>
                  <Divider sx={{ my: 1 }} />
                  <ListItem>
                    <ListItemText primary="Session Timeout (minutes)" />
                    <TextField
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingsChange('security', 'sessionTimeout', parseInt(e.target.value) || 0)}
                      variant="outlined"
                      size="small"
                      InputProps={{ inputProps: { min: 5, max: 120 } }}
                      disabled={loading}
                      sx={{ width: 100 }}
                    />
                  </ListItem>
                </List>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        variant="outlined"
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        variant="outlined"
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        variant="outlined"
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={loading}
                      >
                        Change Password
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
            
            {/* Appearance Settings */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Appearance Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Customize the look and feel of the application.
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <ThemeIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Dark Mode" 
                      secondary="Use dark theme throughout the application"
                    />
                    <Switch
                      edge="end"
                      checked={settings.appearance.darkMode}
                      onChange={(e) => handleSettingsChange('appearance', 'darkMode', e.target.checked)}
                      disabled={loading}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ThemeIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Compact View" 
                      secondary="Use compact layout for tables and lists"
                    />
                    <Switch
                      edge="end"
                      checked={settings.appearance.compactView}
                      onChange={(e) => handleSettingsChange('appearance', 'compactView', e.target.checked)}
                      disabled={loading}
                    />
                  </ListItem>
                  <Divider sx={{ my: 1 }} />
                  <ListItem>
                    <ListItemText primary="Font Size" />
                    <TextField
                      select
                      value={settings.appearance.fontSize}
                      onChange={(e) => handleSettingsChange('appearance', 'fontSize', e.target.value)}
                      variant="outlined"
                      size="small"
                      disabled={loading}
                      sx={{ width: 150 }}
                    >
                      <MenuItem value="small">Small</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="large">Large</MenuItem>
                    </TextField>
                  </ListItem>
                </List>
              </Box>
            )}
            
            {/* System Settings */}
            {activeTab === 4 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  System Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Configure system-wide settings and preferences.
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Language"
                      value={settings.system.language}
                      onChange={(e) => handleSettingsChange('system', 'language', e.target.value)}
                      variant="outlined"
                      disabled={loading}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Date Format"
                      value={settings.system.dateFormat}
                      onChange={(e) => handleSettingsChange('system', 'dateFormat', e.target.value)}
                      variant="outlined"
                      disabled={loading}
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Distance Unit"
                      value={settings.system.distanceUnit}
                      onChange={(e) => handleSettingsChange('system', 'distanceUnit', e.target.value)}
                      variant="outlined"
                      disabled={loading}
                    >
                      <MenuItem value="km">Kilometers (km)</MenuItem>
                      <MenuItem value="mi">Miles (mi)</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Fuel Efficiency Unit"
                      value={settings.system.fuelEfficiencyUnit}
                      onChange={(e) => handleSettingsChange('system', 'fuelEfficiencyUnit', e.target.value)}
                      variant="outlined"
                      disabled={loading}
                    >
                      <MenuItem value="km/L">km/L</MenuItem>
                      <MenuItem value="L/100km">L/100km</MenuItem>
                      <MenuItem value="mpg">MPG (US)</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Currency"
                      value={settings.system.currency}
                      onChange={(e) => handleSettingsChange('system', 'currency', e.target.value)}
                      variant="outlined"
                      disabled={loading}
                    >
                      <MenuItem value="USD">US Dollar ($)</MenuItem>
                      <MenuItem value="EUR">Euro (€)</MenuItem>
                      <MenuItem value="GBP">British Pound (£)</MenuItem>
                      <MenuItem value="CAD">Canadian Dollar (C$)</MenuItem>
                      <MenuItem value="AUD">Australian Dollar (A$)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Settings actions */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ResetIcon />}
                onClick={() => setResetDialogOpen(true)}
                disabled={loading}
              >
                Reset to Defaults
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                onClick={handleSaveSettings}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Reset confirmation dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
      >
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset these settings to their default values? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleResetSettings} color="error" disabled={loading}>Reset</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
