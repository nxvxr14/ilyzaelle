/**
 * Xelorium Library - Utility functions for safer code execution
 */

/**
 * Creates a setInterval with built-in error handling
 * @param {Function|String} code - The code to execute (function or string)
 * @param {Number} tiempo - The interval time in milliseconds
 * @param {String} _id - The board ID for tracking purposes
 * @returns {Number} - The interval ID for clearing later
 */
export function xelInterval(code, tiempo, _id) {
  return setInterval(() => { 
    try { 
      // Execute the code function or evaluate string
      if (typeof code === 'function') {
        code();
      } else {
        eval(code);
      }
    } catch (error) { 
      console.error('Error in xelInterval:', error); 
    }
  }, tiempo, { _id });
}

/**
 * Creates a setTimeout with built-in error handling
 * @param {Function|String} code - The code to execute (function or string)
 * @param {Number} tiempo - The delay time in milliseconds
 * @param {String} _id - The board ID for tracking purposes
 * @returns {Number} - The timeout ID for clearing later
 */
export function xelTimeout(code, tiempo, _id) {
  return setTimeout(() => { 
    try { 
      // Execute the code function or evaluate string
      if (typeof code === 'function') {
        code();
      } else {
        eval(code);
      }
    } catch (error) { 
      console.error('Error in xelTimeout:', error); 
    }
  }, tiempo, { _id });
}
