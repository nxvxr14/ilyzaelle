import React, { useContext } from 'react';
import { SocketContext } from '@/context/SocketContext';
import { useParams } from 'react-router-dom';

interface ScadaToggleComponentProps {
  selectedVar: string;
  gVar: any;
  fontSizeFactor?: number;
}

const ScadaToggleComponent: React.FC<ScadaToggleComponentProps> = ({ 
  selectedVar, 
  gVar,
  fontSizeFactor = 1.0
}) => {
  const { socket } = useContext(SocketContext);
  const params = useParams();
  const projectId = params.projectId!;

  // Obtener el valor actual del toggle
  const isOn = Boolean(gVar[selectedVar]);

  // Función para cambiar el estado del toggle
  const toggleValue = () => {
    if (socket) {
      socket.emit("request-gVariable-change-f-b", selectedVar, !isOn, projectId, (response: any) => {
        console.log("Server acknowledged toggle update:", response);
      });
      
      console.log(`Toggle pressed: Sending value change for ${selectedVar} from ${isOn} to ${!isOn}`);
    }
  };

  // Calcular dimensiones basadas en el factor de escala
  // Aumentar los valores base para que el toggle sea más visible
  const baseToggleWidth = 30;   // Ancho base más grande
  const baseToggleHeight = 16;  // Alto base más grande
  const baseKnobSize = 12;      // Tamaño del botón interno más grande
  
  // Aplicar factor de escala
  const toggleWidth = baseToggleWidth * fontSizeFactor;
  const toggleHeight = baseToggleHeight * fontSizeFactor;
  const knobSize = baseKnobSize * fontSizeFactor;
  const padding = 2 * fontSizeFactor;
  
  // Calcular posición del botón según estado
  const knobPosition = isOn ? toggleWidth - knobSize - padding : padding;

  return (
    <div className="flex items-center justify-center w-full">
      <div 
        role="button"
        onClick={toggleValue}
        className="relative cursor-pointer rounded-full transition-colors"
        style={{
          width: `${toggleWidth}px`,
          height: `${toggleHeight}px`,
          backgroundColor: isOn ? '#FBBF24' : '#4B5563', // Amarillo para ON, gris para OFF
          padding: `${padding}px`,
          transition: 'background-color 0.3s',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        <div 
          className="absolute top-0 rounded-full bg-white shadow-md"
          style={{
            width: `${knobSize}px`,
            height: `${knobSize}px`,
            transform: `translateX(${knobPosition}px)`,
            transition: 'transform 0.3s',
            margin: `${padding}px 0`
          }}
        />
      </div>
    </div>
  );
};

export default ScadaToggleComponent;
