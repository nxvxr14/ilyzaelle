import React, { useContext, useRef, useEffect } from 'react';
import { SocketContext } from '@/context/SocketContext';
import { useParams } from 'react-router-dom';

interface ScadaInputComponentProps {
  selectedVar: string;
  gVar: any;
}

const ScadaInputComponent: React.FC<ScadaInputComponentProps> = ({ selectedVar, gVar }) => {
  const { socket } = useContext(SocketContext);
  const params = useParams();
  const projectId = params.projectId!;
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Usamos ref en lugar de estado para evitar actualizaciones innecesarias
  const valueRef = useRef<number>(typeof gVar[selectedVar] === 'number' ? gVar[selectedVar] : 0);

  // Actualiza el valor mostrado cuando cambia gVar
  useEffect(() => {
    if (typeof gVar[selectedVar] === 'number' && inputRef.current) {
      // Solo actualizamos si no estamos editando
      if (document.activeElement !== inputRef.current) {
        inputRef.current.value = gVar[selectedVar].toString();
        valueRef.current = gVar[selectedVar];
      }
    }
  }, [gVar, selectedVar]);

  // Enviar el valor cuando se presiona Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const numValue = parseFloat(inputRef.current?.value || '0');
      valueRef.current = numValue;
      
      if (socket && !isNaN(numValue)) {
        socket.emit("request-gVariable-change-f-b", selectedVar, numValue, projectId);
      }
      
      // Quitar el foco del input
      inputRef.current?.blur();
    }
  };

  // Función para asegurar que el input obtiene el foco al hacer clic
  const handleForceFocus = () => {
    inputRef.current?.focus();
  };

  // También enviar al perder el foco
  const handleBlur = () => {
    const numValue = parseFloat(inputRef.current?.value || '0');
    if (!isNaN(numValue) && socket) {
      socket.emit("request-gVariable-change-f-b", selectedVar, numValue, projectId);
    }
  };

  return (
    <div className="w-full" onClick={handleForceFocus}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        defaultValue={valueRef.current}
        onKeyDown={handleKeyPress}
        onBlur={handleBlur}
        className="w-full text-center bg-gray-800 text-white border border-gray-600 rounded p-1 text-sm outline-none focus:border-yellow-400"
        style={{ 
          cursor: 'text', 
          pointerEvents: 'auto', 
          touchAction: 'auto' 
        }}
        tabIndex={0}
        autoComplete="off"
        readOnly={false}
      />
    </div>
  );
};

export default ScadaInputComponent;
