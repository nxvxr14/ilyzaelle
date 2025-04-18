import { useState, useEffect } from "react";
import { 
  isValidChartData, 
  isValidInputData, 
  isValidLabelData,
  isValidToggleData, // New validator for toggle components
  validateComponent 
} from "./utils/componentValidators";
import {
  loadComponents,
  saveComponents,
  clearAllComponents
} from "./utils/componentStorage";

interface Component {
  id: number;
  selectedVar: string;
  title: string;
}

export function useComponentManager(projectId: string, gVarData: any) {
  const [charts, setCharts] = useState<Component[]>([]);
  const [inputs, setInputs] = useState<Component[]>([]);
  const [labels, setLabels] = useState<Component[]>([]);
  const [toggles, setToggles] = useState<Component[]>([]); // New state for toggles
  const [selectedVar, setSelectedVar] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage and validate with gVarData
  useEffect(() => {
    if (!projectId) {
      console.error('No projectId provided to useComponentManager');
      return;
    }

    if (!gVarData) return;

    const loadAndValidateComponents = () => {
      try {
        console.log(`Loading dashboard data for project: ${projectId}`);
        
        // Load data from storage
        const storedCharts = loadComponents(projectId, 'charts');
        const storedInputs = loadComponents(projectId, 'inputs');
        const storedLabels = loadComponents(projectId, 'labels');
        const storedToggles = loadComponents(projectId, 'toggles'); // Load stored toggles
        
        // Filter and validate charts
        const validCharts = storedCharts.filter(chart => {
          const validation = validateComponent(chart, gVarData, isValidChartData, 'chart');
          if (!validation.isValid && validation.reason) {
            console.warn(`Removing chart: ${validation.reason}`);
          }
          return validation.isValid;
        });
        
        // Filter and validate inputs
        const validInputs = storedInputs.filter(input => {
          const validation = validateComponent(input, gVarData, isValidInputData, 'input');
          if (!validation.isValid && validation.reason) {
            console.warn(`Removing input: ${validation.reason}`);
          }
          return validation.isValid;
        });
        
        // Filter and validate labels
        const validLabels = storedLabels.filter(label => {
          const validation = validateComponent(label, gVarData, isValidLabelData, 'label');
          if (!validation.isValid && validation.reason) {
            console.warn(`Removing label: ${validation.reason}`);
          }
          return validation.isValid;
        });
        
        // Filter and validate toggles
        const validToggles = storedToggles.filter(toggle => {
          const validation = validateComponent(toggle, gVarData, isValidToggleData, 'toggle');
          if (!validation.isValid && validation.reason) {
            console.warn(`Removing toggle: ${validation.reason}`);
          }
          return validation.isValid;
        });
        
        // Set validated components
        setCharts(validCharts);
        setInputs(validInputs);
        setLabels(validLabels);
        setToggles(validToggles); // Set the validated toggles
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading dashboard data from localStorage:', error);
        setCharts([]);
        setInputs([]);
        setLabels([]);
        setToggles([]);
        setIsInitialized(true);
      }
    };
    
    loadAndValidateComponents();
  }, [projectId, gVarData]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!projectId || !isInitialized) return;
    saveComponents(projectId, 'charts', charts);
  }, [charts, projectId, isInitialized]);

  useEffect(() => {
    if (!projectId || !isInitialized) return;
    saveComponents(projectId, 'inputs', inputs);
  }, [inputs, projectId, isInitialized]);

  useEffect(() => {
    if (!projectId || !isInitialized) return;
    saveComponents(projectId, 'labels', labels);
  }, [labels, projectId, isInitialized]);

  // Save toggles to localStorage when state changes
  useEffect(() => {
    if (!projectId || !isInitialized) return;
    saveComponents(projectId, 'toggles', toggles);
  }, [toggles, projectId, isInitialized]);

  // Component management functions
  const addChart = (varName: string) => {
    if (!varName || !gVarData) {
      console.warn(`Cannot add chart: Variable "${varName}" does not exist or gVarData is not available`);
      return;
    }
    
    if (!isValidChartData(gVarData, varName)) {
      console.warn(`Cannot add chart: Variable "${varName}" is not compatible with chart component`);
      return;
    }
    
    const newChart = { 
      id: Date.now(), 
      selectedVar: varName,
      title: "Nuevo Componente" 
    };
    setCharts(prev => [...prev, newChart]);
    setSelectedVar("");
  };

  const removeChart = (id: number) => {
    setCharts(prev => prev.filter(chart => chart.id !== id));
  };
  
  const updateChartTitle = (id: number, newTitle: string) => {
    setCharts(prev => prev.map(chart => 
      chart.id === id ? { ...chart, title: newTitle } : chart
    ));
  };

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
    setInputs(prev => [...prev, newInput]);
    setSelectedVar("");
  };

  const removeInput = (id: number) => {
    setInputs(prev => prev.filter(input => input.id !== id));
  };
  
  const updateInputTitle = (id: number, newTitle: string) => {
    setInputs(prev => prev.map(input => 
      input.id === id ? { ...input, title: newTitle } : input
    ));
  };

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
    setLabels(prev => [...prev, newLabel]);
    setSelectedVar("");
  };

  const removeLabel = (id: number) => {
    setLabels(prev => prev.filter(label => label.id !== id));
  };
  
  const updateLabelTitle = (id: number, newTitle: string) => {
    setLabels(prev => prev.map(label => 
      label.id === id ? { ...label, title: newTitle } : label
    ));
  };

  // Toggle component management functions
  const addToggle = (varName: string) => {
    if (!varName || !gVarData) {
      console.warn(`Cannot add toggle: Variable "${varName}" does not exist or gVarData is not available`);
      return;
    }
    
    if (!isValidToggleData(gVarData[varName])) {
      console.warn(`Cannot add toggle: Variable "${varName}" is not a boolean type`);
      return;
    }
    
    const newToggle = { 
      id: Date.now(), 
      selectedVar: varName,
      title: "Toggle Control" 
    };
    setToggles(prev => [...prev, newToggle]);
    setSelectedVar("");
  };

  const removeToggle = (id: number) => {
    setToggles(prev => prev.filter(toggle => toggle.id !== id));
  };
  
  const updateToggleTitle = (id: number, newTitle: string) => {
    setToggles(prev => prev.map(toggle => 
      toggle.id === id ? { ...toggle, title: newTitle } : toggle
    ));
  };

  const handleClearAllComponents = () => {
    setCharts([]);
    setInputs([]);
    setLabels([]);
    setToggles([]);
    clearAllComponents(projectId);
  };

  return {
    charts,
    inputs,
    labels,
    toggles,
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
    addToggle,
    removeToggle,
    updateToggleTitle,
    clearAllComponents: handleClearAllComponents
  };
}
