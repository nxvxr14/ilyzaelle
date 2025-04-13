import { useState, useEffect } from "react";

interface Component {
  id: number;
  selectedVar: string;
  title: string;
}

// Helper functions to validate data types for components
const isValidChartData = (gVarData: any, varName: string): boolean => {
  // For charts, we need to ensure there's both the variable data AND a time array
  if (!gVarData || typeof gVarData !== 'object') return false;
  
  // Check if the variable exists and is array-like
  const varData = gVarData[varName];
  const timeData = gVarData.time;
  
  if (!Array.isArray(varData) || varData.length === 0) {
    console.warn(`Variable "${varName}" is not an array or is empty`);
    return false;
  }
  
  if (!Array.isArray(timeData) || timeData.length === 0) {
    console.warn(`Time data is not an array or is empty, which is required for charts`);
    return false;
  }
  
  return true;
};

const isValidInputData = (data: any): boolean => {
  // Inputs can handle numbers, strings, or booleans
  const type = typeof data;
  return type === 'number' || type === 'string' || type === 'boolean';
};

const isValidLabelData = (data: any): boolean => {
  // Labels can display most primitive types (anything with a reasonable toString())
  return data !== undefined && data !== null;
};

export function useComponentManager(projectId: string, gVarData: any) {
  const [charts, setCharts] = useState<Component[]>([]);
  const [inputs, setInputs] = useState<Component[]>([]);
  const [labels, setLabels] = useState<Component[]>([]);
  const [selectedVar, setSelectedVar] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage and validate with gVarData
  useEffect(() => {
    if (!projectId) {
      console.error('No projectId provided to useComponentManager');
      return;
    }

    const loadFromStorage = () => {
      try {
        console.log(`Loading dashboard data for project: ${projectId}`);
        
        const storedCharts = localStorage.getItem(`dashboard-charts-${projectId}`);
        const storedInputs = localStorage.getItem(`dashboard-inputs-${projectId}`);
        const storedLabels = localStorage.getItem(`dashboard-labels-${projectId}`);
        
        // Only proceed with validation if gVarData is available
        if (gVarData) {
          // Process charts
          if (storedCharts) {
            const parsedCharts = JSON.parse(storedCharts);
            if (Array.isArray(parsedCharts)) {
              const validCharts = parsedCharts.filter(chart => {
                // Check if variable exists AND is compatible with chart component
                const varExists = gVarData.hasOwnProperty(chart.selectedVar);
                const isValidType = varExists && isValidChartData(gVarData, chart.selectedVar);
                
                if (!varExists) {
                  console.warn(`Removing chart: Variable "${chart.selectedVar}" does not exist`);
                } else if (!isValidType) {
                  console.warn(`Removing chart: Variable "${chart.selectedVar}" is not compatible with chart component`);
                }
                
                return isValidType;
              });
              
              if (validCharts.length !== parsedCharts.length) {
                console.info(`Filtered out ${parsedCharts.length - validCharts.length} charts with incompatible variables`);
              }
              
              setCharts(validCharts);
            }
          }
          
          // Process inputs
          if (storedInputs) {
            const parsedInputs = JSON.parse(storedInputs);
            if (Array.isArray(parsedInputs)) {
              const validInputs = parsedInputs.filter(input => {
                // Check if variable exists AND is compatible with input component
                const varExists = gVarData.hasOwnProperty(input.selectedVar);
                const varData = gVarData[input.selectedVar];
                const isValidType = varExists && isValidInputData(varData);
                
                if (!varExists) {
                  console.warn(`Removing input: Variable "${input.selectedVar}" does not exist`);
                } else if (!isValidType) {
                  console.warn(`Removing input: Variable "${input.selectedVar}" is not a valid input type, found: ${typeof varData}`);
                }
                
                return isValidType;
              });
              
              if (validInputs.length !== parsedInputs.length) {
                console.info(`Filtered out ${parsedInputs.length - validInputs.length} inputs with incompatible variables`);
              }
              
              setInputs(validInputs);
            }
          }
          
          // Process labels
          if (storedLabels) {
            const parsedLabels = JSON.parse(storedLabels);
            if (Array.isArray(parsedLabels)) {
              const validLabels = parsedLabels.filter(label => {
                // Check if variable exists AND is compatible with label component
                const varExists = gVarData.hasOwnProperty(label.selectedVar);
                const varData = gVarData[label.selectedVar];
                const isValidType = varExists && isValidLabelData(varData);
                
                if (!varExists) {
                  console.warn(`Removing label: Variable "${label.selectedVar}" does not exist`);
                } else if (!isValidType) {
                  console.warn(`Removing label: Variable "${label.selectedVar}" is null or undefined`);
                }
                
                return isValidType;
              });
              
              if (validLabels.length !== parsedLabels.length) {
                console.info(`Filtered out ${parsedLabels.length - validLabels.length} labels with incompatible variables`);
              }
              
              setLabels(validLabels);
            }
          }
          
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error loading dashboard data from localStorage:', error);
        // Initialize with empty arrays in case of error
        setCharts([]);
        setInputs([]);
        setLabels([]);
        setIsInitialized(true);
      }
    };
    
    // Only load from storage if gVarData is available
    if (gVarData) {
      loadFromStorage();
    }
  }, [projectId, gVarData]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!projectId || !isInitialized) return;
    
    try {
      console.log(`Saving charts for project ${projectId}:`, charts);
      localStorage.setItem(`dashboard-charts-${projectId}`, JSON.stringify(charts));
    } catch (error) {
      console.error('Error saving charts to localStorage:', error);
    }
  }, [charts, projectId, isInitialized]);

  useEffect(() => {
    if (!projectId || !isInitialized) return;
    
    try {
      console.log(`Saving inputs for project ${projectId}:`, inputs);
      localStorage.setItem(`dashboard-inputs-${projectId}`, JSON.stringify(inputs));
    } catch (error) {
      console.error('Error saving inputs to localStorage:', error);
    }
  }, [inputs, projectId, isInitialized]);

  useEffect(() => {
    if (!projectId || !isInitialized) return;
    
    try {
      console.log(`Saving labels for project ${projectId}:`, labels);
      localStorage.setItem(`dashboard-labels-${projectId}`, JSON.stringify(labels));
    } catch (error) {
      console.error('Error saving labels to localStorage:', error);
    }
  }, [labels, projectId, isInitialized]);

  // Add new chart only if the variable exists and is array-like and time data exists
  const addChart = (varName: string) => {
    if (!varName || !gVarData) {
      console.warn(`Cannot add chart: Variable "${varName}" does not exist or gVarData is not available`);
      return;
    }
    
    // Updated validation to check specific Chart requirements
    if (!isValidChartData(gVarData, varName)) {
      console.warn(`Cannot add chart: Variable "${varName}" is not compatible with chart component`);
      return;
    }
    
    const newChart = { 
      id: Date.now(), 
      selectedVar: varName,
      title: "Nuevo Componente" 
    };
    console.log('Adding chart:', newChart);
    setCharts(prev => [...prev, newChart]);
    setSelectedVar("");
  };

  const removeChart = (id: number) => {
    console.log('Removing chart with id:', id);
    setCharts(prev => prev.filter(chart => chart.id !== id));
  };
  
  const updateChartTitle = (id: number, newTitle: string) => {
    console.log(`Updating chart ${id} title to: ${newTitle}`);
    setCharts(prev => prev.map(chart => 
      chart.id === id ? { ...chart, title: newTitle } : chart
    ));
  };

  // Add new input only if the variable exists and is a valid input type
  const addInput = (varName: string) => {
    if (!varName || !gVarData) {
      console.warn(`Cannot add input: Variable "${varName}" does not exist`);
      return;
    }
    
    const varData = gVarData[varName];
    if (!isValidInputData(varData)) {
      console.warn(`Cannot add input: Variable "${varName}" is not a valid input type`);
      return;
    }
    
    const newInput = { 
      id: Date.now(), 
      selectedVar: varName,
      title: "Nuevo Componente" 
    };
    console.log('Adding input:', newInput);
    setInputs(prev => [...prev, newInput]);
    setSelectedVar("");
  };

  const removeInput = (id: number) => {
    console.log('Removing input with id:', id);
    setInputs(prev => prev.filter(input => input.id !== id));
  };
  
  const updateInputTitle = (id: number, newTitle: string) => {
    console.log(`Updating input ${id} title to: ${newTitle}`);
    setInputs(prev => prev.map(input => 
      input.id === id ? { ...input, title: newTitle } : input
    ));
  };

  // Add new label only if the variable exists and is displayable
  const addLabel = (varName: string) => {
    if (!varName || !gVarData) {
      console.warn(`Cannot add label: Variable "${varName}" does not exist`);
      return;
    }
    
    const varData = gVarData[varName];
    if (!isValidLabelData(varData)) {
      console.warn(`Cannot add label: Variable "${varName}" is null or undefined`);
      return;
    }
    
    const newLabel = { 
      id: Date.now(), 
      selectedVar: varName,
      title: "Nuevo Componente" 
    };
    console.log('Adding label:', newLabel);
    setLabels(prev => [...prev, newLabel]);
    setSelectedVar("");
  };

  const removeLabel = (id: number) => {
    console.log('Removing label with id:', id);
    setLabels(prev => prev.filter(label => label.id !== id));
  };
  
  const updateLabelTitle = (id: number, newTitle: string) => {
    console.log(`Updating label ${id} title to: ${newTitle}`);
    setLabels(prev => prev.map(label => 
      label.id === id ? { ...label, title: newTitle } : label
    ));
  };

  const clearAllComponents = () => {
    console.log(`Clearing all components for project: ${projectId}`);
    setCharts([]);
    setInputs([]);
    setLabels([]);
    
    try {
      localStorage.removeItem(`dashboard-charts-${projectId}`);
      localStorage.removeItem(`dashboard-inputs-${projectId}`);
      localStorage.removeItem(`dashboard-labels-${projectId}`);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  return {
    charts,
    inputs,
    labels,
    selectedVar,
    setSelectedVar,
    addChart,
    removeChart,
    updateChartTitle,
    addInput,
    removeInput,
    updateInputTitle,
    addLabel,
    removeLabel,
    updateLabelTitle,
    clearAllComponents
  };
}
