import React, { useState, useContext, useEffect, useRef } from 'react';
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
  
  // Obtener el valor actual y guardarlo en el estado local
  const [inputValue, setInputValue] = useState<number>(
    typeof gVar[selectedVar] === 'number' ? gVar[selectedVar] : 0
  );
  
  // Estado para controlar si el usuario está editando activamente
  const [isEditing, setIsEditing] = useState(false);
  
  // Referencia del último valor emitido
  const lastSyncedValue = useRef(inputValue);

  // Actualizar el estado local cuando cambie el valor en gVar, SOLO si el usuario NO está editando
  useEffect(() => {
    if (!isEditing && typeof gVar[selectedVar] === 'number' && lastSyncedValue.current !== gVar[selectedVar]) {
      setInputValue(gVar[selectedVar]);
      lastSyncedValue.current = gVar[selectedVar];
    }
  }, [gVar, selectedVar, isEditing]);

  // Función para enviar el nuevo valor
  const handleSendValue = () => {
    if (socket) {
      socket.emit("request-gVariable-change-f-b", selectedVar, inputValue, projectId, (response: any) => {
        console.log("Server acknowledged input update:", response);
      });
      
      console.log(`Input: Sending value change for ${selectedVar} to ${inputValue}`);
      lastSyncedValue.current = inputValue;
      setIsEditing(false); // Ya no estamos editando después de enviar
    }
  };
  
  // Manejar el inicio de la edición
  const handleFocus = () => {
    setIsEditing(true);
  };
  
  // Manejar cuando el usuario termina de editar
  const handleBlur = () => {
    setIsEditing(false);
  };
  
  // Manejar cambio de valor en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(Number(e.target.value));
  };
  
  // Manejar la tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendValue();
      e.currentTarget.blur(); // Quitar el foco después de enviar
    }
  };

  return (
    <div className="flex w-full justify-center">
      <input
        type="number"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full py-1 px-2 text-center bg-gray-800 border border-gray-600 hover:border-gray-400 focus:border-blue-500 rounded text-white outline-none"
      />
    </div>
  );
};

export default ScadaInputComponent;
