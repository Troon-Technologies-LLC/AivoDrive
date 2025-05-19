/**
 * Response Utility Functions
 * Standardizes API responses across the application
 */

/**
 * Create a success response object
 * @param {String} message - Success message
 * @param {*} data - Data to be returned
 * @param {Number} statusCode - HTTP status code
 * @returns {Object} Formatted success response
 */
const successResponse = (message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    statusCode
  };

  if (data !== null) {
    response.data = data;
  }

  return response;
};

/**
 * Create an error response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @param {*} error - Error details (only included in development)
 * @returns {Object} Formatted error response
 */
const errorResponse = (message, statusCode = 400, error = null) => {
  const response = {
    success: false,
    message,
    statusCode
  };

  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error;
  }

  return response;
};

/**
 * Create a paginated response object
 * @param {Array} data - Data array to be paginated
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @param {Number} total - Total number of items
 * @param {String} message - Success message
 * @returns {Object} Formatted paginated response
 */
const paginatedResponse = (data, page, limit, total, message = 'Data retrieved successfully') => {
  return {
    success: true,
    message,
    statusCode: 200,
    data,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};
