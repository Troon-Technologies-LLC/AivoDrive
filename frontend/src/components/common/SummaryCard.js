/**
 * SummaryCard Component
 * Reusable card component for displaying summary information in each module
 */

import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Divider
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

/**
 * SummaryCard component for displaying module summary information
 * @param {Object} props - Component props
 * @param {String} props.title - Card title
 * @param {String|Number} props.value - Main value to display
 * @param {String} props.subtitle - Optional subtitle or description
 * @param {Object} props.icon - Optional icon component
 * @param {Array} props.actions - Array of action objects {label, icon, onClick}
 * @param {Object} props.sx - Additional styles
 * @returns {JSX.Element} SummaryCard component
 */
const SummaryCard = ({ title, value, subtitle, icon, sx = {} }) => {
  // No action menu state or handlers needed anymore
  // Format the value to prevent NaN display
  const displayValue = isNaN(value) ? '0' : value;
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        bgcolor: '#1e1e1e', 
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        ...sx 
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && (
            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              {icon}
            </Box>
          )}
          <Typography variant="subtitle1" color="text.secondary">
            {title}
          </Typography>
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 500, mb: 1 }}>
          {displayValue}
        </Typography>
        
        {subtitle && !isNaN(parseFloat(subtitle)) && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
