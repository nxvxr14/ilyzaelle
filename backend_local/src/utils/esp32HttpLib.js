import axios from "axios";
import { gVar } from "../controllers/UpdateCodeBoardController.js";

// Store connection configurations by project
const connections = {};

// Configuration settings
const TIMEOUT = 3000;         // 3 seconds timeout
const CACHE_TTL = 500;        // Cache values for 500ms to prevent flooding requests
const cacheByProject = {};    // Cache store for getVariables

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
    console.error("Missing required parameters: project, ip, and serverAPIKey are required");
    return null;
  }

  // Store connection info
  connections[project] = {
    ip,
    port,
    serverAPIKey,
    baseUrl: `http://${ip}:${port}`,
    lastRequest: 0,
  };

  console.log(`ESP32 connection configured for project ${project} at ${ip}:${port}`);
  
  // Initialize project in gVar if needed
  if (!gVar[project]) {
    gVar[project] = {};
  }
  
  return connections[project];
}

/**
 * Get available variables from the ESP32
 * @param {Object} params - Request parameters
 * @param {String} params.project - Project identifier
 * @returns {Promise<Array>} - List of available variable info
 */
export async function getAvailableVariables({ project }) {
  try {
    // Check if connection exists
    if (!connections[project]) {
      console.error(`No connection configured for project: ${project}`);
      return [];
    }

    const { baseUrl, serverAPIKey } = connections[project];
    
    // Make request with timeout
    const response = await axios.get(`${baseUrl}/variables`, {
      params: { serverAPIKey },
      timeout: TIMEOUT,
    });

    if (response.status === 200 && response.data && response.data.variables) {
      return response.data.variables;
    }
    return [];
  } catch (error) {
    console.error(`Error getting ESP32 variables: ${error.message}`);
    return [];
  }
}

/**
 * Get variable values from ESP32 and store in gVar
 * Uses caching to prevent too frequent requests
 * @param {Object} params - Request parameters
 * @param {String} params.project - Project identifier
 * @returns {Promise<Object>} - The updated gVar[project] object
 */
export async function getVariables({ project }) {
  try {
    // Check if connection exists
    if (!connections[project]) {
      console.error(`No connection configured for project: ${project}`);
      return gVar[project] || {};
    }

    // Check cache to prevent flooding ESP32 with requests
    const now = Date.now();
    if (cacheByProject[project] && now - cacheByProject[project].timestamp < CACHE_TTL) {
      return cacheByProject[project].data;
    }

    const { baseUrl, serverAPIKey } = connections[project];
    
    // Make request with timeout
    const response = await axios.get(`${baseUrl}/values`, {
      params: { serverAPIKey },
      timeout: TIMEOUT,
    });

    if (response.status === 200 && response.data && response.data.values) {
      // Initialize project in gVar if needed
      if (!gVar[project]) {
        gVar[project] = {};
      }
      
      // Update variables in gVar
      const variables = response.data.values;
      Object.keys(variables).forEach(varName => {
        gVar[project][varName] = variables[varName];
      });
      
      // Update cache
      cacheByProject[project] = {
        timestamp: now,
        data: gVar[project],
      };
      
      return gVar[project];
    }
    
    // Return whatever we have in gVar if request fails
    return gVar[project] || {};
  } catch (error) {
    // Return cached data on error if available
    if (cacheByProject[project]) {
      console.error(`Error fetching ESP32 variables (using cached data): ${error.message}`);
      return cacheByProject[project].data;
    }
    
    console.error(`Error fetching ESP32 variables: ${error.message}`);
    return gVar[project] || {};
  }
}

/**
 * Set a variable value on the ESP32
 * @param {Object} params - Request parameters
 * @param {String} params.project - Project identifier
 * @param {String} params.variable - Variable name to update
 * @param {*} params.value - New value for the variable
 * @returns {Promise<boolean>} - Success status
 */
export async function setVariable({ project, variable, value }) {
  try {
    // Check if connection exists
    if (!connections[project]) {
      console.error(`No connection configured for project: ${project}`);
      return false;
    }

    if (!variable) {
      console.error("Variable name is required");
      return false;
    }

    const { baseUrl, serverAPIKey } = connections[project];
    
    // Optimistically update local value right away
    if (gVar[project]) {
      gVar[project][variable] = value;
    }
    
    // Make request with timeout
    const response = await axios.post(
      `${baseUrl}/set`,
      { serverAPIKey, variable, value },
      { timeout: TIMEOUT }
    );

    if (response.status === 200 && response.data && response.data.success) {
      console.log(`Successfully set ${variable} to ${value}`);
      
      // Update cache to reflect the new value
      if (cacheByProject[project]) {
        cacheByProject[project].data[variable] = value;
      }
      
      return true;
    }
    
    if (response.data && response.data.message) {
      console.error(`Error from ESP32: ${response.data.message}`);
    }
    
    return false;
  } catch (error) {
    console.error(`Error setting ESP32 variable: ${error.message}`);
    return false;
  }
}

/**
 * Check if ESP32 is responsive
 * @param {Object} params - Request parameters
 * @param {String} params.project - Project identifier
 * @returns {Promise<boolean>} - True if ESP32 is responding
 */
export async function pingESP32({ project }) {
  try {
    // Check if connection exists
    if (!connections[project]) {
      console.error(`No connection configured for project: ${project}`);
      return false;
    }

    const { baseUrl, serverAPIKey } = connections[project];
    
    // Make request with shorter timeout
    await axios.get(`${baseUrl}/status`, {
      params: { serverAPIKey },
      timeout: 1000, // Shorter timeout for ping
    });
    
    return true;
  } catch (error) {
    console.error(`ESP32 not responding: ${error.message}`);
    return false;
  }
}

/**
 * Disconnect from the ESP32 and cleanup
 * @param {Object} params - Request parameters
 * @param {String} params.project - Project identifier
 * @returns {boolean} - Success status
 */
export function disconnectESP32({ project }) {
  try {
    if (connections[project]) {
      console.log(`Disconnecting from ESP32 for project ${project}`);
      delete connections[project];
      delete cacheByProject[project];
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error disconnecting from ESP32: ${error.message}`);
    return false;
  }
}

// Alias for backward compatibility
export const closeConnection = disconnectESP32;