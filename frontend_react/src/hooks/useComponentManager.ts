import { useState } from "react";

interface Component {
  id: number;
  selectedVar: string;
  title: string;
}

export function useComponentManager() {
  const [charts, setCharts] = useState<Component[]>([]);
  const [inputs, setInputs] = useState<Component[]>([]);
  const [labels, setLabels] = useState<Component[]>([]);
  const [selectedVar, setSelectedVar] = useState<string>('');

  const addChart = (varName: string) => {
    if (!varName) return;
    setCharts([...charts, { 
      id: Date.now(), 
      selectedVar: varName,
      title: "Nuevo Componente" 
    }]);
    setSelectedVar("");
  };

  const removeChart = (id: number) => {
    setCharts(charts.filter(chart => chart.id !== id));
  };
  
  const updateChartTitle = (id: number, newTitle: string) => {
    setCharts(charts.map(chart => 
      chart.id === id ? { ...chart, title: newTitle } : chart
    ));
  };

  const addInput = (varName: string) => {
    if (!varName) return;
    setInputs([...inputs, { 
      id: Date.now(), 
      selectedVar: varName,
      title: "Nuevo Componente" 
    }]);
    setSelectedVar("");
  };

  const removeInput = (id: number) => {
    setInputs(inputs.filter(input => input.id !== id));
  };
  
  const updateInputTitle = (id: number, newTitle: string) => {
    setInputs(inputs.map(input => 
      input.id === id ? { ...input, title: newTitle } : input
    ));
  };

  const addLabel = (varName: string) => {
    if (!varName) return;
    setLabels([...labels, { 
      id: Date.now(), 
      selectedVar: varName,
      title: "Nuevo Componente" 
    }]);
    setSelectedVar("");
  };

  const removeLabel = (id: number) => {
    setLabels(labels.filter(label => label.id !== id));
  };
  
  const updateLabelTitle = (id: number, newTitle: string) => {
    setLabels(labels.map(label => 
      label.id === id ? { ...label, title: newTitle } : label
    ));
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
    updateLabelTitle
  };
}
