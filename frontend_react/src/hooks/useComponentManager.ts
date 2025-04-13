import { useState, useEffect } from "react";

interface Component {
  id: number;
  selectedVar: string;
  title: string;
}

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
                const isValid = gVarData.hasOwnProperty(chart.selectedVar);
                if (!isValid) {
                  console.warn(`Removing chart with non-existent variable: ${chart.selectedVar}`);
                }
                return isValid;
              });
              
              if (validCharts.length !== parsedCharts.length) {
                console.info(`Filtered out ${parsedCharts.length - validCharts.length} charts with non-existent variables`);
              }
              
              setCharts(validCharts);
            }
          }
          
          // Process inputs
          if (storedInputs) {
            const parsedInputs = JSON.parse(storedInputs);
            if (Array.isArray(parsedInputs)) {
              const validInputs = parsedInputs.filter(input => {
                const isValid = gVarData.hasOwnProperty(input.selectedVar);
                if (!isValid) {
                  console.warn(`Removing input with non-existent variable: ${input.selectedVar}`);
                }
                return isValid;
              });
              
              if (validInputs.length !== parsedInputs.length) {
                console.info(`Filtered out ${parsedInputs.length - validInputs.length} inputs with non-existent variables`);
              }
              
              setInputs(validInputs);
            }
          }
          
          // Process labels
          if (storedLabels) {
            const parsedLabels = JSON.parse(storedLabels);
            if (Array.isArray(parsedLabels)) {
              const validLabels = parsedLabels.filter(label => {
                const isValid = gVarData.hasOwnProperty(label.selectedVar);
                if (!isValid) {
                  console.warn(`Removing label with non-existent variable: ${label.selectedVar}`);
                }
                return isValid;
              });
              
              if (validLabels.length !== parsedLabels.length) {
                console.info(`Filtered out ${parsedLabels.length - validLabels.length} labels with non-existent variables`);
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

  // Add new chart only if the variable exists in gVarData
  const addChart = (varName: string) => {
    if (!varName || !gVarData || !gVarData.hasOwnProperty(varName)) {
      console.warn(`Cannot add chart: Variable "${varName}" does not exist`);
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

  // Add new input only if the variable exists in gVarData
  const addInput = (varName: string) => {
    if (!varName || !gVarData || !gVarData.hasOwnProperty(varName)) {
      console.warn(`Cannot add input: Variable "${varName}" does not exist`);
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

  // Add new label only if the variable exists in gVarData
  const addLabel = (varName: string) => {
    if (!varName || !gVarData || !gVarData.hasOwnProperty(varName)) {
      console.warn(`Cannot add label: Variable "${varName}" does not exist`);
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
