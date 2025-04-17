/**
 * Validation utilities for dashboard components
 */

/**
 * Validates if the data is suitable for a chart component
 * Charts require both the variable data and time arrays
 */
export const isValidChartData = (gVarData: any, varName: string): boolean => {
  if (!gVarData || typeof gVarData !== 'object') return false;
  
  const varData = gVarData[varName];
  
  // Check for variable-specific time vector first (new format)
  const timeVectorName = `${varName}_time`;
  let timeData = gVarData[timeVectorName];
  
  // If specific time vector doesn't exist, fall back to global time (legacy format)
  if (!timeData) {
    timeData = gVarData.time;
  }
  
  if (!Array.isArray(varData) || varData.length === 0) {
    console.warn(`Variable "${varName}" is not an array or is empty`);
    return false;
  }
  
  if (!Array.isArray(timeData) || timeData.length === 0) {
    console.warn(`Time data (${timeVectorName} or time) is not an array or is empty, which is required for charts`);
    return false;
  }
  
  return true;
};

/**
 * Validates if the data is suitable for an input component
 * Inputs can handle numbers, strings, or booleans
 */
export const isValidInputData = (data: any): boolean => {
  const type = typeof data;
  return type === 'number' || type === 'string' || type === 'boolean';
};

/**
 * Validates if the data is suitable for a label component
 * Labels can display most primitive types (anything with a reasonable toString())
 */
export const isValidLabelData = (data: any): boolean => {
  return data !== undefined && data !== null;
};

/**
 * Validates if a component's variable exists and has the correct type
 */
export const validateComponent = (
  component: { selectedVar: string },
  gVarData: any, 
  validator: (data: any) => boolean | ((data: any, varName: string) => boolean),
  componentType: string
): { isValid: boolean, reason?: string } => {
  const varName = component.selectedVar;
  
  // Check if variable exists
  if (!gVarData.hasOwnProperty(varName)) {
    return { 
      isValid: false, 
      reason: `Variable "${varName}" does not exist` 
    };
  }
  
  const varData = gVarData[varName];
  
  // Check if the validator is the chart validator which requires the varName
  let isValidType;
  if (componentType === 'chart') {
    isValidType = (validator as (data: any, varName: string) => boolean)(gVarData, varName);
  } else {
    isValidType = (validator as (data: any) => boolean)(varData);
  }
  
  if (!isValidType) {
    return {
      isValid: false,
      reason: `Variable "${varName}" is not compatible with ${componentType} component`
    };
  }
  
  return { isValid: true };
};
