import React from 'react';
import Input from './Input';  // Importar el componente original
import Label from './Label';  // Importar el componente original
import Toggle from './Toggle';  // Importar el componente original

// Componente para mostrar el último valor de un array
export const ScadaArrayValueView: React.FC<{ values: any[]; selectedVar: string }> = ({ values, selectedVar }) => {
  const lastValue = values && values.length > 0 ? values[values.length - 1] : null;
  
  return (
    <div className="p-1">
      <div className="text-yellow-400 font-mono text-lg">
        {lastValue !== null ? lastValue : 'N/A'}
      </div>
    </div>
  );
};

// Wrapper para Label que simplemente usa el componente original
export const ScadaLabelView: React.FC<{ selectedVar: string; gVar: any }> = ({ selectedVar, gVar }) => {
  return (
    <div className="p-1">
      <Label selectedVar={selectedVar} gVar={gVar} />
    </div>
  );
};

// Wrapper para Toggle que usa el componente original
export const ScadaToggleView: React.FC<{ selectedVar: string; gVar: any }> = ({ selectedVar, gVar }) => {
  return (
    <div className="p-1">
      <Toggle selectedVar={selectedVar} gVar={gVar} />
    </div>
  );
};

// Wrapper para Input que usa el componente original
export const ScadaInputView: React.FC<{ selectedVar: string; gVar: any }> = ({ selectedVar, gVar }) => {
  return (
    <div className="p-1">
      <Input selectedVar={selectedVar} gVar={gVar} />
    </div>
  );
};
