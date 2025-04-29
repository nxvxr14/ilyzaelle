import React, { useState } from 'react';

interface ScadaComponentSelectorProps {
  gVarData: any;
  onAddComponent: (type: 'input' | 'label' | 'toggle' | 'arrayValue', varName: string) => void;
}

const ScadaComponentSelector: React.FC<ScadaComponentSelectorProps> = ({ gVarData, onAddComponent }) => {
  const [selectedVar, setSelectedVar] = useState<string>('');
  
  // Verificar si hay variables disponibles
  if (!gVarData || Object.keys(gVarData).length === 0) {
    return (
      <div className="bg-[#1a1625] p-4 rounded-lg">
        <p className="text-gray-400">No hay variables disponibles para añadir al panel SCADA.</p>
      </div>
    );
  }
  
  // Determinar el tipo de variable seleccionada
  const getVarType = (varName: string) => {
    if (!varName || !gVarData[varName]) return null;
    
    const value = gVarData[varName];
    if (Array.isArray(value)) return 'arrayValue';
    if (typeof value === 'boolean') return 'toggle';
    if (typeof value === 'number' || typeof value === 'string') return ['label', 'input'];
    
    return null;
  };
  
  const availableTypes = getVarType(selectedVar);
  
  return (
    <div className="bg-[#1a1625] p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-300 mb-3">Añadir componente al SCADA</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Seleccionar variable</label>
          <select 
            className="w-full bg-[#120d18] text-gray-200 py-2 px-3 rounded-md border border-gray-700 focus:border-yellow-400 focus:outline-none"
            value={selectedVar}
            onChange={(e) => setSelectedVar(e.target.value)}
          >
            <option value="">-- Seleccione una variable --</option>
            {Object.keys(gVarData).map(varName => (
              <option key={varName} value={varName}>
                {varName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-400 mb-2">Añadir como:</label>
          <div className="flex gap-3">
            {!availableTypes && (
              <p className="text-gray-500">Seleccione una variable primero</p>
            )}
            
            {availableTypes === 'arrayValue' && (
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
                onClick={() => onAddComponent('arrayValue', selectedVar)}
                disabled={!selectedVar}
              >
                Valor de Array
              </button>
            )}
            
            {availableTypes === 'toggle' && (
              <button
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors font-medium"
                onClick={() => onAddComponent('toggle', selectedVar)}
                disabled={!selectedVar}
              >
                Interruptor
              </button>
            )}
            
            {Array.isArray(availableTypes) && (
              <>
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium"
                  onClick={() => onAddComponent('label', selectedVar)}
                  disabled={!selectedVar}
                >
                  Etiqueta
                </button>
                <button
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors font-medium"
                  onClick={() => onAddComponent('input', selectedVar)}
                  disabled={!selectedVar}
                >
                  Input
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScadaComponentSelector;
