/**
 * Profile Page
 * Allows users to view and edit their profile information
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Badge as BadgeIcon,
  History as HistoryIcon,
  Lock as LockIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

/**
 * Profile component for viewing and editing user profile information
 * @returns {JSX.Element} Profile page
 */
const Profile = () => {
  const { user, token, updateUser } = useAuth();
  
  // State for profile data
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || '',
    department: user?.department || '',
    employeeId: user?.employeeId || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });
  
  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  
  // State for loading and error
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);
  
  // Mock activity data
  const [activityLogs, setActivityLogs] = useState([
    {
      id: 1,
      action: 'Login',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      details: 'Successful login from Chrome on Windows'
    },
    {
      id: 2,
      action: 'Profile Update',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      details: 'Updated profile information'
    },
    {
      id: 3,
      action: 'Password Change',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
      details: 'Changed account password'
    },
    {
      id: 4,
      action: 'Login',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), // 8 days ago
      details: 'Successful login from Safari on macOS'
    },
    {
      id: 5,
      action: 'Account Created',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
      details: 'Account was created'
    }
  ]);
  
  /**
   * Handle profile change
   * @param {Object} event - Event object
   */
  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear success message when profile is changed
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };
  
  /**
   * Handle password change
   * @param {Object} event - Event object
   */
  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error and success messages
    setPasswordError(null);
    setPasswordSuccess(false);
  };
  
  /**
   * Save profile changes
   */
  const handleSaveProfile = () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    
    // Simulate API call to save profile
    setTimeout(() => {
      // In a real implementation, this would be an API call to save profile
      updateUser({
        ...user,
        ...profile
      });
      
      setLoading(false);
      setSaveSuccess(true);
      setEditMode(false);
    }, 1000);
  };
  
  /**
   * Cancel profile edit
   */
  const handleCancelEdit = () => {
    // Reset profile data to user data
    setProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || '',
      department: user?.department || '',
      employeeId: user?.employeeId || '',
      address: user?.address || '',
      bio: user?.bio || ''
    });
    
    setEditMode(false);
    setSaveSuccess(false);
    setError(null);
  };
  
  /**
   * Change password
   */
  const handleChangePassword = () => {
    // Validate password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    
    // Simulate API call to change password
    setTimeout(() => {
      // In a real implementation, this would be an API call to change password
      setLoading(false);
      setPasswordSuccess(true);
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Add activity log
      setActivityLogs(prev => [
        {
          id: prev.length + 1,
          action: 'Password Change',
          timestamp: new Date().toISOString(),
          details: 'Changed account password'
        },
        ...prev
      ]);
      
      // Close dialog after a delay
      setTimeout(() => {
        setPasswordDialogOpen(false);
      }, 2000);
    }, 1000);
  };
  
  /**
   * Handle tab change
   * @param {Object} event - Event object
   * @param {Number} newValue - New tab index
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  /**
   * Format date to readable format
   * @param {String} dateString - Date string
   * @returns {String} Formatted date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Get role display name
   * @param {String} role - Role code
   * @returns {String} Role display name
   */
  const getRoleDisplayName = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'Administrator';
      case ROLES.DISPATCHER:
        return 'Dispatcher';
      case ROLES.DRIVER:
        return 'Driver';
      default:
        return role;
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;
    } else if (profile.firstName) {
      return profile.firstName.charAt(0);
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    } else {
      return 'U';
    }
  };
  
  // Get avatar color based on user role
  const getAvatarColor = () => {
    switch (profile.role) {
      case ROLES.ADMIN:
        return 'primary.main';
      case ROLES.DISPATCHER:
        return 'secondary.main';
      case ROLES.DRIVER:
        return 'success.main';
      default:
        return 'grey.500';
    }
  };
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Profile
        </Typography>
        {!editMode ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleCancelEdit}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
              onClick={handleSaveProfile}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Success message */}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Profile tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<PersonIcon />} label="Profile" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<HistoryIcon />} label="Activity" />
        </Tabs>
        
        {/* Profile tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Profile avatar and basic info */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      fontSize: 48,
                      mb: 2,
                      bgcolor: getAvatarColor()
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                  <Typography variant="h5">
                    {profile.firstName} {profile.lastName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {getRoleDisplayName(profile.role)}
                  </Typography>
                </Box>
                
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Contact Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon />
                        </ListItemIcon>
                        <ListItemText primary="Email" secondary={profile.email} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText primary="Phone" secondary={profile.phone || 'Not provided'} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Work Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <WorkIcon />
                        </ListItemIcon>
                        <ListItemText primary="Department" secondary={profile.department || 'Not provided'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <BadgeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Employee ID" secondary={profile.employeeId || 'Not provided'} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Profile edit form */}
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  {editMode ? 'Edit Profile Information' : 'Profile Information'}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleProfileChange}
                      disabled={!editMode || loading}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleProfileChange}
                      disabled={!editMode || loading}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      disabled={!editMode || loading}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      disabled={!editMode || loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={profile.department}
                      onChange={handleProfileChange}
                      disabled={!editMode || loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                      name="employeeId"
                      value={profile.employeeId}
                      onChange={handleProfileChange}
                      disabled={!editMode || loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={profile.address}
                      onChange={handleProfileChange}
                      disabled={!editMode || loading}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      name="bio"
                      value={profile.bio}
                      onChange={handleProfileChange}
                      disabled={!editMode || loading}
                      multiline
                      rows={4}
                      placeholder="Tell us about yourself"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Security tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Manage your account security settings and credentials.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LockIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box>
                      <Typography variant="h6">Password</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Change your account password
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Change Password
                  </Button>
                </Box>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <KeyIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box>
                      <Typography variant="h6">Two-Factor Authentication</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Add an extra layer of security to your account
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    color="primary"
                  >
                    Set Up
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
        
        {/* Activity tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Activity
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Recent activity and login history for your account.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List>
              {activityLogs.map((log, index) => (
                <React.Fragment key={log.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <HistoryIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={log.action}
                      secondary={
                        <React.Fragment>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            component="span"
                            sx={{ display: 'block' }}
                          >
                            {log.details}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            component="span"
                          >
                            {formatDate(log.timestamp)}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < activityLogs.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </Paper>
      
      {/* Change password dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => !loading && setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password changed successfully!
            </Alert>
          ) : passwordError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          ) : (
            <DialogContentText sx={{ mb: 2 }}>
              Please enter your current password and a new password.
            </DialogContentText>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                disabled={loading || passwordSuccess}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                disabled={loading || passwordSuccess}
                required
                helperText="Password must be at least 8 characters long"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                disabled={loading || passwordSuccess}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPasswordDialogOpen(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleChangePassword} 
            color="primary" 
            disabled={loading || passwordSuccess || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
