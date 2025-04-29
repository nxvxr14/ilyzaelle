import React, { useContext } from 'react';
import { SocketContext } from '@/context/SocketContext';

interface ScadaLabelComponentProps {
  selectedVar: string;
  gVar: any;
}

const ScadaLabelComponent: React.FC<ScadaLabelComponentProps> = ({ selectedVar, gVar }) => {
  // Si el valor es undefined o null, mostrar N/A
  const value = gVar[selectedVar];
  const displayValue = value !== undefined && value !== null ? value : 'N/A';
  
  return (
    <div className="flex items-center justify-center p-1">
      <span className="text-white font-mono text-base">
        {String(displayValue)}
      </span>
    </div>
  );
};

export default ScadaLabelComponent;
