import React from 'react';

interface ScadaArrayDisplayComponentProps {
  selectedVar: string;
  gVar: any;
}

const ScadaArrayDisplayComponent: React.FC<ScadaArrayDisplayComponentProps> = ({ selectedVar, gVar }) => {
  // Obtener el array
  const array = gVar[selectedVar];
  
  // Verificar si es un array válido
  if (!Array.isArray(array) || array.length === 0) {
    return <div className="text-gray-400 text-center">No hay datos</div>;
  }
  
  // Mostrar el último valor del array
  const lastValue = array[array.length - 1];
  
  return (
    <div className="flex flex-col items-center p-1">
      <div className="text-yellow-400 font-mono text-xl">
        {lastValue !== undefined ? lastValue : 'N/A'}
      </div>
    </div>
  );
};

export default ScadaArrayDisplayComponent;
