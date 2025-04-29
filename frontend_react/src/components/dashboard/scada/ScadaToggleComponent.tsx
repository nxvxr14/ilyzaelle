import React, { useContext } from 'react';
import { SocketContext } from '@/context/SocketContext';
import { useParams } from 'react-router-dom';

interface ScadaToggleComponentProps {
  selectedVar: string;
  gVar: any;
}

const ScadaToggleComponent: React.FC<ScadaToggleComponentProps> = ({ selectedVar, gVar }) => {
  const { socket } = useContext(SocketContext);
  const params = useParams();
  const projectId = params.projectId!;

  // Obtener el valor actual del toggle
  const isOn = Boolean(gVar[selectedVar]);

  // Función para cambiar el estado del toggle - CORREGIDA
  const toggleValue = () => {
    if (socket) {
      // Usar exactamente el mismo evento que en el componente Toggle original
      socket.emit("request-gVariable-change-f-b", selectedVar, !isOn, projectId, (response: any) => {
        // Callback para confirmar que el servidor recibió el evento
        console.log("Server acknowledged toggle update:", response);
      });
      
      console.log(`Toggle pressed: Sending value change for ${selectedVar} from ${isOn} to ${!isOn}`);
    }
  };

  return (
    <div className="flex items-center justify-center p-1">
      <button
        onClick={toggleValue}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
          isOn ? 'bg-yellow-400' : 'bg-gray-600'
        }`}
      >
        <span
          className={`bg-white h-4 w-4 rounded-full shadow-md transform transition-transform ${
            isOn ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export default ScadaToggleComponent;
