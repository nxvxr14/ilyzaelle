/**
 * ESP32 HTTP Communication Library
 * Compatible with ESPAPIServer Arduino library
 */
import axios from 'axios';
import { gVar } from '../controllers/UpdateCodeBoardController.js';

// Store connection configurations by project
const connections = {};

/**
 * Initialize the connection settings for an ESP32 device
 * @param {Object} config - Connection configuration
 * @param {String} config.project - Project identifier
 * @param {String} config.ip - ESP32 IP address 
 * @param {String} config.serverAPIKey - API key for authentication
 * @param {String} config.port - Optional port number (default: 80)
 * @returns {Object} - Connection configuration
 */
export function setConnection({ project, ip, serverAPIKey, port = 80 }) {
  if (!project || !ip || !serverAPIKey) {
    throw new Error('Missing required parameters: project, ip, and serverAPIKey are required');
  }
  
  connections[project] = {
    ip,
    port,
    serverAPIKey,
    baseUrl: `http://${ip}:${port}`
  };
  
  console.log(`ESP32 connection configured for project ${project} at ${ip}:${port}`);
  return connections[project];
}

/**
 * Get available variables and their metadata from the ESP32
 * @param {Object} params - Request parameters
 * @param {String} params.project - Project identifier
 * @param {String} params._id - Board ID for timer tracking
 * @returns {Promise<Array>} - List of variable information objects
 */
export async function getAvailableVariables({ project, _id }) {
  try {
    validateConnection(project);
    
    const { baseUrl, serverAPIKey } = connections[project];
    const response = await axios.get(`${baseUrl}/variables`, {
      params: { serverAPIKey }
    });
    
    if (response.status === 200 && response.data && response.data.variables) {
      // The response now contains detailed variable information
      return response.data.variables;
    }
    return [];
  } catch (error) {
    console.error(`Error getting available variables: ${error.message}`);
    return [];
  }
}

/**
 * Get variable values from ESP32 and store in gVar
 * @param {Object} params - Request parameters
 * @param {String} params.project - Project identifier
 * @param {String} params._id - Board ID for timer tracking
 * @returns {Promise<Object>} - The updated gVar[project] object
 */
export async function getVariables({ project, _id }) {
  try {
    validateConnection(project);
    
    const { baseUrl, serverAPIKey } = connections[project];
    const response = await axios.get(`${baseUrl}/values`, {
      params: { serverAPIKey }
    });
    
    if (response.status === 200 && response.data && response.data.values) {
      // Initialize project object if it doesn't exist
      if (!gVar[project]) {
        gVar[project] = {};
      }
      
      // Store all variables in gVar[project]
      const variables = response.data.values;
      Object.keys(variables).forEach(varName => {
        gVar[project][varName] = variables[varName];
      });
      
      return gVar[project];
    }
    return gVar[project] || {};
  } catch (error) {
    console.error(`Error fetching ESP32 variables: ${error.message}`);
    return gVar[project] || {};
  }
}

/**
 * Set a variable value on the ESP32
 * @param {Object} params - Request parameters
 * @param {String} params.project - Project identifier
 * @param {String} params._id - Board ID for timer tracking
 * @param {String} params.variable - Variable name to update
 * @param {*} params.value - New value for the variable
 * @returns {Promise<boolean>} - Success status
 */
export async function setVariable({ project, _id, variable, value }) {
  try {
    validateConnection(project);
    
    if (!variable) {
      throw new Error('Variable name is required');
    }
    
    const { baseUrl, serverAPIKey } = connections[project];
    const response = await axios.post(`${baseUrl}/set`, {
      serverAPIKey,
      variable,
      value
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`Successfully set ${variable} to ${value} on ESP32`);
      return true;
    }
    
    if (response.data && response.data.message) {
      console.error(`Error setting variable: ${response.data.message}`);
    }
    
    return false;
  } catch (error) {
    console.error(`Error setting ESP32 variable: ${error.message}`);
    if (error.response && error.response.data) {
      console.error('Server response:', error.response.data);
    }
    return false;
  }
}

// Utility to check if connection is configured
function validateConnection(project) {
  if (!connections[project]) {
    throw new Error(`No connection configured for project: ${project}. Call setConnection first.`);
  }
}
