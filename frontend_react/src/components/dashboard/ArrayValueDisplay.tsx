import React from 'react';

interface ArrayValueDisplayProps {
  selectedVar: string;
  gVar: any;
}

const ArrayValueDisplay: React.FC<ArrayValueDisplayProps> = ({ selectedVar, gVar }) => {
  if (!gVar || !gVar[selectedVar] || !Array.isArray(gVar[selectedVar])) {
    return <div className="text-gray-400">No hay datos disponibles</div>;
  }
  
  const array = gVar[selectedVar];
  const lastValue = array.length > 0 ? array[array.length - 1] : null;
  
  return (
    <div className="p-2">
      <div className="text-sm text-gray-400 mb-1">Último valor:</div>
      <div className="text-2xl font-mono text-yellow-400">{lastValue !== null ? lastValue : 'N/A'}</div>
    </div>
  );
};

export default ArrayValueDisplay;
