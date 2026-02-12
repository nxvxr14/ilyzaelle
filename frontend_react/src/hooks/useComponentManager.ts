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

// Definir nuevas interfaces para componentes SCADA
interface ScadaComponent {
  id: string;
  type: 'input' | 'label' | 'toggle' | 'arrayValue';
  selectedVar: string;
  position: { x: number; y: number };
  title: string;
  fontSizeFactor?: number; // Nuevo campo para almacenar el factor de escalado de texto
}

export function useComponentManager(projectId: string, gVarData: any) {
  const [charts, setCharts] = useState<Component[]>([]);
  const [inputs, setInputs] = useState<Component[]>([]);
  const [labels, setLabels] = useState<Component[]>([]);
  const [toggles, setToggles] = useState<Component[]>([]); // New state for toggles
  const [scadaComponents, setScadaComponents] = useState<ScadaComponent[]>([]); // New state for SCADA components
  const [selectedVar, setSelectedVar] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [scadaBackgroundUrl, setScadaBackgroundUrl] = useState<string>('');

  // Load from localStorage and validate with gVarData
  useEffect(() => {
    if (!projectId) {
      console.error('No projectId provided to useComponentManager');
      return;
    }

    if (!gVarData) return;

    const loadAndValidateComponents = () => {
      try {
        // Load data from storage
        const storedCharts = loadComponents(projectId, 'charts');
        const storedInputs = loadComponents(projectId, 'inputs');
        const storedLabels = loadComponents(projectId, 'labels');
        const storedToggles = loadComponents(projectId, 'toggles'); // Load stored toggles
        
        // Load SCADA background URL
        const storedScadaBackground = localStorage.getItem(`${projectId}_scada_background`);
        if (storedScadaBackground) {
          setScadaBackgroundUrl(storedScadaBackground);
        }
        
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
        setScadaBackgroundUrl('');
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

  // Save SCADA background to localStorage
  useEffect(() => {
    if (!projectId || !isInitialized) return;
    
    if (scadaBackgroundUrl) {
      localStorage.setItem(`${projectId}_scada_background`, scadaBackgroundUrl);
    } else {
      localStorage.removeItem(`${projectId}_scada_background`);
    }
  }, [scadaBackgroundUrl, projectId, isInitialized]);

  // Cargar componentes de SCADA del localStorage
  useEffect(() => {
    if (!projectId || !isInitialized || !gVarData) return;
    
    try {
      const storedComponents = localStorage.getItem(`${projectId}_scada_components`);
      if (storedComponents) {
        const parsedComponents = JSON.parse(storedComponents);
        // Validar componentes: campos requeridos, posición válida, y variable existente en gVarData
        const validComponents = parsedComponents.filter((comp: ScadaComponent) => {
          return comp && 
                 comp.id && 
                 comp.selectedVar && 
                 comp.position && 
                 typeof comp.position.x === 'number' &&
                 typeof comp.position.y === 'number' &&
                 gVarData[comp.selectedVar] !== undefined;
        });
        setScadaComponents(validComponents);
      }
    } catch (error) {
      console.error('Error loading SCADA components:', error);
      setScadaComponents([]);
    }
  }, [projectId, gVarData, isInitialized]);

  // Guardar componentes de SCADA en el localStorage
  useEffect(() => {
    if (!projectId || !isInitialized) return;
    saveScadaComponentsToStorage(scadaComponents);
  }, [scadaComponents, projectId, isInitialized]);

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

  // Funciones para manejar componentes de SCADA
  const addScadaComponent = (type: 'input' | 'label' | 'toggle' | 'arrayValue', varName: string) => {
    if (!varName || !gVarData || gVarData[varName] === undefined) {
      console.warn(`Cannot add SCADA component: Variable "${varName}" does not exist`);
      return;
    }
    
    // Para arrays, usar arrayValue en lugar de chart
    if (Array.isArray(gVarData[varName]) && type !== 'arrayValue') {
      type = 'arrayValue';
    }
  
    // Posición inicial con offset aleatorio para evitar superposición
    const randomOffset = {
      x: Math.floor(Math.random() * 100), // Valor aleatorio entre 0-100
      y: Math.floor(Math.random() * 100)  // Valor aleatorio entre 0-100
    };
    
    // Crear el nuevo componente con posición inicial aleatoria y factor de escala por defecto
    const newComponent: ScadaComponent = {
      id: `scada-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      selectedVar: varName,
      position: { x: 50 + randomOffset.x, y: 50 + randomOffset.y }, // Posición inicial con offset
      title: `${varName} (${type})`,
      fontSizeFactor: 1.0 // Valor predeterminado
    };
    
    setScadaComponents(prev => [...prev, newComponent]);
  };
  
  const removeScadaComponent = (id: string) => {
    setScadaComponents(prev => prev.filter(comp => comp.id !== id));
  };
  
  const updateScadaComponentPosition = (id: string, position: { x: number, y: number }) => {
    // Asegurar que la posición tiene valores válidos
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      console.error('Invalid position:', position);
      return;
    }
    
    // Actualizar estado con la nueva posición
    setScadaComponents(prev => {
      // Crear un nuevo array con la posición actualizada
      const updated = prev.map(comp => {
        if (comp.id === id) {
          // Crear un nuevo objeto de componente con la nueva posición
          return {
            ...comp,
            position: { 
              x: position.x,
              y: position.y
            }
          };
        }
        return comp;
      });
      
      // Guardar el estado actualizado en localStorage
      const storageKey = `${projectId}_scada_components`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      
      return updated;
    });
  };
  
  const updateScadaComponentTitle = (id: string, title: string) => {
    setScadaComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, title } : comp
    ));
  };

  // Añadir función para actualizar el factor de tamaño de texto
  const updateScadaComponentFontSize = (id: string, fontSizeFactor: number) => {
    setScadaComponents(prev => {
      const updated = prev.map(comp => 
        comp.id === id ? { ...comp, fontSizeFactor } : comp
      );
      
      // Guardar inmediatamente en localStorage
      const storageKey = `${projectId}_scada_components`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      
      return updated;
    });
  };

  const handleClearAllComponents = () => {
    setCharts([]);
    setInputs([]);
    setLabels([]);
    setToggles([]);
    setScadaBackgroundUrl('');
    setScadaComponents([]);
    clearAllComponents(projectId);
    localStorage.removeItem(`${projectId}_scada_background`);
    localStorage.removeItem(`${projectId}_scada_components`);
  };

  // Función robusta para guardar componentes en localStorage
  const saveScadaComponentsToStorage = (components: ScadaComponent[]) => {
    if (!projectId || !isInitialized) return;
    
    try {
      const storageKey = `${projectId}_scada_components`;
      localStorage.setItem(storageKey, JSON.stringify(components));
      
      // Verificar que se guardó correctamente
      const savedData = localStorage.getItem(storageKey);
      if (!savedData) {
        console.error('Failed to verify saved SCADA components');
      }
    } catch (error) {
      console.error('Error saving SCADA components to localStorage:', error);
    }
  };

  return {
    charts,
    inputs,
    labels,
    toggles,
    scadaComponents,
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
    addScadaComponent,
    removeScadaComponent,
    updateScadaComponentPosition,
    updateScadaComponentTitle,
    updateScadaComponentFontSize, // Añadir la nueva función al return
    scadaBackgroundUrl,
    setScadaBackgroundUrl,
    clearAllComponents: handleClearAllComponents
  };
}
