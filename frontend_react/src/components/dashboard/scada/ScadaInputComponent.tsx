import React, { useState, useContext, useEffect } from 'react';
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

  // Actualizar el estado local cuando cambie el valor en gVar
  useEffect(() => {
    if (typeof gVar[selectedVar] === 'number') {
      setInputValue(gVar[selectedVar]);
    }
  }, [gVar, selectedVar]);

  // Función para enviar el nuevo valor - CORREGIDA
  const handleSendValue = () => {
    if (socket) {
      // Usar exactamente el mismo evento que en el componente Input original
      socket.emit("request-gVariable-change-f-b", selectedVar, inputValue, projectId, (response: any) => {
        // Callback para confirmar que el servidor recibió el evento
        console.log("Server acknowledged input update:", response);
      });
      
      console.log(`Input: Sending value change for ${selectedVar} to ${inputValue}`);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(Number(e.target.value))}
        className="w-12 p-1 text-xs bg-gray-800 border border-gray-600 rounded text-white"
      />
      <button
        onClick={handleSendValue}
        className="bg-yellow-500 hover:bg-yellow-600 text-black rounded px-2 py-1 text-xs"
      >
        →
      </button>
    </div>
  );
};

export default ScadaInputComponent;
