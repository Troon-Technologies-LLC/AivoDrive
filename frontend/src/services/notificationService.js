/**
 * Notification Service
 * Provides functions for displaying consistent success and error notifications throughout the application
 */

import { toast } from 'react-toastify';

/**
 * Configuration for toast notifications
 */
const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

/**
 * Display a success notification
 * @param {string} message - The success message to display
 */
export const showSuccess = (message) => {
  toast.success(message, toastConfig);
};

/**
 * Display an error notification
 * @param {string} message - The error message to display
 * @param {Error|Object} error - Optional error object for logging
 */
export const showError = (message, error = null) => {
  // Log the error to console for debugging if provided
  if (error) {
    console.error('Error details:', error);
  }
  
  // Extract error message from various error formats
  let errorMessage = message;
  
  // Try to extract more specific error message if available
  if (error) {
    if (error.response && error.response.data) {
      // Axios error format
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      }
    } else if (error.message) {
      // Standard Error object
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      // String error
      errorMessage = error;
    }
  }
  
  toast.error(errorMessage, toastConfig);
};

/**
 * Display an info notification
 * @param {string} message - The info message to display
 */
export const showInfo = (message) => {
  toast.info(message, toastConfig);
};

/**
 * Display a warning notification
 * @param {string} message - The warning message to display
 */
export const showWarning = (message) => {
  toast.warn(message, toastConfig);
};

const notificationService = {
  showSuccess,
  showError,
  showInfo,
  showWarning
};

export default notificationService;
