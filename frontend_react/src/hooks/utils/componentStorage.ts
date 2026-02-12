/**
 * Storage utilities for dashboard components
 */

interface Component {
  id: number;
  selectedVar: string;
  title: string;
}

/**
 * Loads dashboard components from localStorage
 */
export const loadComponents = (projectId: string, componentType: string): Component[] => {
  try {
    const storageKey = `dashboard-${componentType}-${projectId}`;
    const storedData = localStorage.getItem(storageKey);
    
    if (!storedData) return [];
    
    const parsedData = JSON.parse(storedData);
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error(`Error loading ${componentType} from localStorage:`, error);
    return [];
  }
};

/**
 * Saves dashboard components to localStorage
 */
export const saveComponents = (
  projectId: string, 
  componentType: string, 
  components: Component[]
): void => {
  try {
    const storageKey = `dashboard-${componentType}-${projectId}`;
    localStorage.setItem(storageKey, JSON.stringify(components));
  } catch (error) {
    console.error(`Error saving ${componentType} to localStorage:`, error);
  }
};

/**
 * Clears dashboard components from localStorage
 */
export const clearComponents = (projectId: string, componentType: string): void => {
  try {
    const storageKey = `dashboard-${componentType}-${projectId}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error(`Error clearing ${componentType} from localStorage:`, error);
  }
};

/**
 * Clears all dashboard components from localStorage
 */
export const clearAllComponents = (projectId: string): void => {
  try {
    clearComponents(projectId, 'charts');
    clearComponents(projectId, 'inputs');
    clearComponents(projectId, 'labels');
  } catch (error) {
    console.error('Error clearing components from localStorage:', error);
  }
};
