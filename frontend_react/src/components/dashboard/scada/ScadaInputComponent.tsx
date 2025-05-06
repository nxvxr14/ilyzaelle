import React, { useContext, useState } from 'react';
import { SocketContext } from '@/context/SocketContext';
import { useParams } from 'react-router-dom';

interface ScadaInputComponentProps {
  selectedVar: string;
  gVar: any;
  serverAPIKey?: string; // Añadir serverAPIKey como prop opcional
}

const ScadaInputComponent: React.FC<ScadaInputComponentProps> = ({ 
  selectedVar, 
  gVar,
  serverAPIKey 
}) => {
  const params = useParams();
  const projectId = params.projectId!;
  const { socket } = useContext(SocketContext);
  
  const [inputValue, setInputValue] = useState<number>(gVar[selectedVar] || 0);
  
  const handleUpdate = () => {
    if (socket) {
      // Incluir serverAPIKey en la emisión del socket
      socket.emit("request-gVariable-change-f-b", selectedVar, inputValue, projectId, serverAPIKey, (response: any) => {
        console.log("Server acknowledged scada input update:", response);
      });
      
      console.log(`SCADA Input: Updating ${selectedVar} to ${inputValue} with serverAPIKey: ${serverAPIKey}`);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(Number(e.target.value))}
        className="w-16 h-6 text-sm text-center rounded border border-gray-600 bg-gray-800 text-white"
      />
      <button
        onClick={handleUpdate}
        className="h-6 px-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
      >
        ✓
      </button>
    </div>
  );
};

export default ScadaInputComponent;
