import axios from "axios";
import { gVar } from "../controllers/UpdateCodeBoardController.js";

// Store connection configurations by project
const connections = {};
const TIMEOUT = 2000;          // Reduced from 3000ms to 2000ms
const MAX_RETRIES = 2;         // Reduced from 3 to 2 for faster failures
const RETRY_DELAY = 150;       // Reduced from 300ms to 150ms
const REQUEST_THROTTLE = 200;  // Reduced from 500ms to 200ms

// Last request timestamps to implement throttling
const lastRequestTime = {};

// Store cancelation tokens for each project
const cancelTokens = {};

/**
 * Sleep function for delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validate if connection is configured for a project
 */
function validateConnection(project) {
  if (!connections[project]) {
    throw new Error(`No connection configured for project: ${project}. Call setConnection first.`);
  }
}

/**
 * Helper function to throttle requests to the same ESP32
 */
async function throttleRequest(project) {
  const now = Date.now();
  if (lastRequestTime[project]) {
    const timeSinceLastRequest = now - lastRequestTime[project];
    if (timeSinceLastRequest < REQUEST_THROTTLE) {
      // Wait to ensure minimum spacing between requests
      await sleep(REQUEST_THROTTLE - timeSinceLastRequest);
    }
  }
  lastRequestTime[project] = Date.now();
}

/**
 * Retry wrapper for API calls
 */
async function withRetry(project, operation) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Throttle requests to avoid overwhelming the ESP32
      await throttleRequest(project);
      
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on canceled requests
      if (axios.isCancel(error)) {
        throw error;
      }
      
      console.log(`Attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);
      
      if (attempt < MAX_RETRIES) {
        // Exponential backoff with jitter for retries
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1) * (0.5 + Math.random() * 0.5);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

/**
 * Initialize the connection settings for an ESP32 device
 */
export function setConnection({ project, ip, serverAPIKey, port = 80 }) {
  // First close any existing connection for this project
  if (connections[project]) {
    closeConnection(project);
  }
  
  if (!project || !ip || !serverAPIKey) {
    throw new Error(
      "Missing required parameters: project, ip, and serverAPIKey are required"
    );
  }

  // Create a new cancel token source for this project
  cancelTokens[project] = axios.CancelToken.source();

  connections[project] = {
    ip,
    port,
    serverAPIKey,
    baseUrl: `http://${ip}:${port}`,
  };

  console.log(
    `ESP32 connection configured for project ${project} at ${ip}:${port}`
  );
  
  // Initialize gVar for this project if it doesn't exist
  if (!gVar[project]) {
    gVar[project] = {};
  }
  
  return connections[project];
}

/**
 * Close the connection to an ESP32 device for a specific project
 */
export function closeConnection(project) {
  try {
    if (connections[project]) {
      console.log(`Closing ESP32 connection for project ${project}`);

      // Cancel any pending requests
      if (cancelTokens[project]) {
        cancelTokens[project].cancel('Connection closed');
        // Create a new cancel token for future requests
        cancelTokens[project] = axios.CancelToken.source();
      }

      // Remove the connection configuration
      delete connections[project];
      
      // Clear the throttling timestamp
      delete lastRequestTime[project];
      
      return true;
    } else {
      console.log(`No active ESP32 connection found for project ${project}`);
      return false;
    }
  } catch (error) {
    console.error(`Error closing ESP32 connection: ${error.message}`);
    return false;
  }
}

/**
 * Check if ESP32 connection is healthy
 */
export async function checkConnection(project) {
  try {
    validateConnection(project);
    const { baseUrl } = connections[project];
    
    // Simple ping request to check if ESP32 is responding
    await axios.get(`${baseUrl}/ping`, { 
      timeout: 1000,
      cancelToken: cancelTokens[project]?.token
    });
    return true;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log(`Connection check for ${project} was cancelled`);
    } else {
      console.error(`ESP32 connection check failed: ${error.message}`);
    }
    return false;
  }
}

/**
 * Get available variables from the ESP32
 */
export async function getAvailableVariables({ project }) {
  try {
    validateConnection(project);

    return await withRetry(project, async () => {
      const { baseUrl, serverAPIKey } = connections[project];
      const response = await axios.get(`${baseUrl}/variables`, {
        params: { serverAPIKey },
        timeout: TIMEOUT,
        cancelToken: cancelTokens[project]?.token
      });
      
      if (response.status === 200 && response.data && response.data.variables) {
        return response.data.variables;
      }
      return [];
    });
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log(`Request for ${project} was cancelled`);
    } else {
      console.error(`Error getting available variables: ${error.message}`);
    }
    return [];
  }
}

/**
 * Get current variable values from the ESP32
 */
export async function getVariables({ project }) {
  try {
    validateConnection(project);
    
    return await withRetry(project, async () => {
      const { baseUrl, serverAPIKey } = connections[project];
      const response = await axios.get(`${baseUrl}/values`, {
        params: { serverAPIKey },
        timeout: TIMEOUT,
        cancelToken: cancelTokens[project]?.token
      });
      
      if (response.status === 200 && response.data && response.data.values) {
        if (!gVar[project]) {
          gVar[project] = {};
        }
        
        const variables = response.data.values;
        Object.keys(variables).forEach((varName) => {
          gVar[project][varName] = variables[varName];
        });
        
        return gVar[project];
      }
      return gVar[project] || {};
    });
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log(`Request for ${project} was cancelled`);
    } else {
      console.error(`Error fetching ESP32 variables: ${error.message}`);
    }
    return gVar[project] || {};
  }
}

/**
 * Set a variable value on the ESP32
 */
export async function setVariable({ project, variable, value }) {
  try {
    validateConnection(project);
    
    if (!variable) {
      throw new Error("Variable name is required");
    }
    
    return await withRetry(project, async () => {
      const { baseUrl, serverAPIKey } = connections[project];
      const response = await axios.post(`${baseUrl}/set`, {
        serverAPIKey,
        variable,
        value,
      }, {
        timeout: TIMEOUT,
        cancelToken: cancelTokens[project]?.token
      });
      
      if (response.status === 200 && response.data.success) {
        // Update local cache
        if (!gVar[project]) {
          gVar[project] = {};
        }
        gVar[project][variable] = value;
        
        console.log(`${Date.now()} seteado`+ variable + " " + value);
        return true;
      }
      
      if (response.data && response.data.message) {
        console.error(`Error setting variable: ${response.data.message}`);
      }
      
      return false;
    });
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log(`Request for ${project} was cancelled`);
    } else {
      console.error(`Error setting ESP32 variable: ${error.message}`);
    }
    return false;
  }
}

// For compatibility with existing code
export const disconnectESP32 = closeConnection;