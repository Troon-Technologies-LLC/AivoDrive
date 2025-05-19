/**
 * Help Page
 * Provides user assistance, documentation, and FAQs for the AivoDrive application
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  Divider,
  Link
} from '@mui/material';
import {
  Help as HelpIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Book as GuideIcon,
  LiveHelp as FAQIcon,
  ContactSupport as SupportIcon,
  VideoLibrary as TutorialIcon,
  Info as InfoIcon,
  DirectionsCar as VehicleIcon,
  Person as DriverIcon,
  Route as TripIcon,
  Build as MaintenanceIcon,
  LocalGasStation as FuelIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

/**
 * Help component with documentation, FAQs, and support resources
 * @returns {JSX.Element} Help page
 */
const Help = () => {
  // State for active help tab
  const [activeTab, setActiveTab] = useState(0);
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  
  /**
   * Handle tab change
   * @param {Object} event - Event object
   * @param {Number} newValue - New tab index
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  /**
   * Handle search query change
   * @param {Object} event - Event object
   */
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  /**
   * Filter help items based on search query
   * @param {Array} items - Help items to filter
   * @returns {Array} Filtered help items
   */
  const filterHelpItems = (items) => {
    if (!searchQuery) return items;
    
    return items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  // FAQ data
  const faqItems = [
    {
      question: 'How do I add a new vehicle to the system?',
      answer: 'To add a new vehicle, navigate to the Vehicles section from the main menu, then click on the "Add Vehicle" button. Fill in the required information such as make, model, year, license plate, and other details. Click "Save" to add the vehicle to the system.'
    },
    {
      question: 'How do I assign a driver to a vehicle?',
      answer: 'You can assign a driver to a vehicle in two ways: 1) From the Vehicle Detail page, click on "Assign Driver" and select a driver from the dropdown. 2) From the Driver Detail page, click on "Assign Vehicle" and select a vehicle from the dropdown.'
    },
    {
      question: 'How do I schedule maintenance for a vehicle?',
      answer: 'Navigate to the Maintenance section from the main menu, then click on "Schedule Maintenance". Select the vehicle, maintenance type, date, and other details. You can also schedule maintenance directly from a Vehicle Detail page by clicking on the "Schedule Maintenance" button.'
    },
    {
      question: 'How do I create a new trip?',
      answer: 'Go to the Trips section from the main menu, then click on "Create Trip". Fill in the required information such as origin, destination, date, vehicle, and driver. You can also create a trip from the Vehicle Detail or Driver Detail pages.'
    },
    {
      question: 'How do I generate reports?',
      answer: 'Navigate to the Reports section from the main menu. Select the report type, date range, and other filters as needed. Click on "Generate Report" to view the report. You can also export reports as CSV or print them.'
    },
    {
      question: 'How do I add a fuel record?',
      answer: 'Go to the Fuel section from the main menu, then click on "Add Fuel Record". Select the vehicle, enter the fuel amount, price, odometer reading, and other details. You can also add a fuel record directly from a Vehicle Detail page.'
    },
    {
      question: 'How do I change my account settings?',
      answer: 'Click on your profile icon in the top-right corner of the screen, then select "Settings". From there, you can update your profile information, notification preferences, security settings, and application preferences.'
    },
    {
      question: 'What are the different user roles in the system?',
      answer: 'AivoDrive has three main user roles: Admin, Dispatcher, and Driver. Admins have full access to all features. Dispatchers can manage trips, vehicles, and drivers, but cannot modify system settings. Drivers have limited access to view their assigned vehicles and trips.'
    },
    {
      question: 'How do I reset my password?',
      answer: 'If you forgot your password, click on the "Forgot Password" link on the login page. Enter your email address to receive a password reset link. If you know your current password and want to change it, go to Settings > Security and use the "Change Password" option.'
    },
    {
      question: 'Can I export data from the system?',
      answer: 'Yes, you can export data from most sections of the application. Look for the "Export" or "Download" button in the top-right corner of the page. Reports can be exported as CSV files, and you can also print reports directly from the browser.'
    }
  ];
  
  // User guide sections
  const guideItems = [
    {
      title: 'Getting Started',
      icon: <InfoIcon />,
      content: 'Welcome to AivoDrive, your comprehensive fleet management solution. This guide will help you get started with the system and make the most of its features.'
    },
    {
      title: 'Vehicle Management',
      icon: <VehicleIcon />,
      content: 'Learn how to add, edit, and manage vehicles in the system. Track vehicle status, maintenance history, fuel consumption, and more.'
    },
    {
      title: 'Driver Management',
      icon: <DriverIcon />,
      content: 'Manage driver profiles, track driver performance, assign vehicles to drivers, and monitor driver activity.'
    },
    {
      title: 'Trip Management',
      icon: <TripIcon />,
      content: 'Create and manage trips, track trip status, assign vehicles and drivers to trips, and view trip history.'
    },
    {
      title: 'Maintenance Management',
      icon: <MaintenanceIcon />,
      content: 'Schedule and track vehicle maintenance, set up maintenance reminders, and view maintenance history.'
    },
    {
      title: 'Fuel Management',
      icon: <FuelIcon />,
      content: 'Record and track fuel consumption, monitor fuel costs, and analyze fuel efficiency.'
    },
    {
      title: 'Reports and Analytics',
      icon: <ReportIcon />,
      content: 'Generate reports on vehicle usage, fuel consumption, maintenance costs, and more. Export data for further analysis.'
    },
    {
      title: 'Settings and Preferences',
      icon: <SettingsIcon />,
      content: 'Configure application settings, user preferences, notification settings, and system defaults.'
    }
  ];
  
  // Video tutorials
  const tutorialItems = [
    {
      title: 'Getting Started with AivoDrive',
      duration: '5:32',
      url: '#'
    },
    {
      title: 'Managing Vehicles and Drivers',
      duration: '8:45',
      url: '#'
    },
    {
      title: 'Creating and Managing Trips',
      duration: '6:18',
      url: '#'
    },
    {
      title: 'Tracking Maintenance and Fuel',
      duration: '7:22',
      url: '#'
    },
    {
      title: 'Generating Reports and Analytics',
      duration: '9:10',
      url: '#'
    },
    {
      title: 'Advanced Features and Settings',
      duration: '10:05',
      url: '#'
    }
  ];
  
  // Support resources
  const supportItems = [
    {
      title: 'Contact Support',
      description: 'Get in touch with our support team for personalized assistance.',
      action: 'Contact Now',
      url: '#'
    },
    {
      title: 'Submit a Bug Report',
      description: 'Found a bug? Let us know so we can fix it.',
      action: 'Report Bug',
      url: '#'
    },
    {
      title: 'Feature Request',
      description: 'Have an idea for a new feature? We'd love to hear it!',
      action: 'Submit Request',
      url: '#'
    },
    {
      title: 'Community Forum',
      description: 'Join our community forum to discuss with other users and get help.',
      action: 'Join Forum',
      url: '#'
    }
  ];
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Help & Support
        </Typography>
      </Box>
      
      {/* Search bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search for help topics..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Paper>
      
      {/* Help tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<FAQIcon />} label="FAQs" />
          <Tab icon={<GuideIcon />} label="User Guide" />
          <Tab icon={<TutorialIcon />} label="Video Tutorials" />
          <Tab icon={<SupportIcon />} label="Support" />
        </Tabs>
        
        {/* Tab content */}
        <Box sx={{ p: 3 }}>
          {/* FAQs Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Frequently Asked Questions</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Find answers to common questions about using AivoDrive.
              </Typography>
              
              {filterHelpItems(faqItems).length > 0 ? (
                filterHelpItems(faqItems).map((item, index) => (
                  <Accordion key={index} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">{item.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body1">{item.answer}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No FAQs found matching your search query.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          {/* User Guide Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>User Guide</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Comprehensive documentation to help you use AivoDrive effectively.
              </Typography>
              
              <List>
                {guideItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem button>
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.title} 
                        secondary={item.content} 
                        primaryTypographyProps={{ variant: 'subtitle1' }}
                        secondaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    {index < guideItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
          
          {/* Video Tutorials Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Video Tutorials</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Watch step-by-step video guides to learn how to use AivoDrive.
              </Typography>
              
              <Grid container spacing={3}>
                {tutorialItems.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <Box 
                        sx={{ 
                          height: 160, 
                          bgcolor: 'grey.200', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}
                      >
                        <TutorialIcon sx={{ fontSize: 60, color: 'grey.500' }} />
                      </Box>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duration: {item.duration}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          fullWidth 
                          sx={{ mt: 2 }}
                          href={item.url}
                        >
                          Watch Tutorial
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* Support Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Support Resources</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Get help from our support team or community resources.
              </Typography>
              
              <Grid container spacing={3}>
                {supportItems.map((item, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{item.title}</Typography>
                        <Typography variant="body2" paragraph>{item.description}</Typography>
                        <Button 
                          variant="contained" 
                          color="primary"
                          href={item.url}
                        >
                          {item.action}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>Contact Information</Typography>
                <Typography variant="body1" paragraph>
                  If you need further assistance, you can reach our support team at:
                </Typography>
                <Typography variant="body1" paragraph>
                  Email: <Link href="mailto:support@aivodrive.com">support@aivodrive.com</Link>
                </Typography>
                <Typography variant="body1" paragraph>
                  Phone: +1 (555) 123-4567
                </Typography>
                <Typography variant="body1">
                  Support Hours: Monday to Friday, 9:00 AM - 5:00 PM EST
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Help;
