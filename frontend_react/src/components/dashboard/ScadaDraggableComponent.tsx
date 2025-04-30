import React, { useState, useRef, useEffect } from 'react';

type Position = {
  x: number;
  y: number;
};

interface ScadaDraggableComponentProps {
  id: string;
  initialPosition: Position;
  onPositionChange: (id: string, position: Position) => void;
  onRemove: (id: string) => void;
  children: React.ReactNode;
  varName: string;
}

const ScadaDraggableComponent: React.FC<ScadaDraggableComponentProps> = ({
  id,
  initialPosition,
  onPositionChange,
  onRemove,
  children,
  varName
}) => {
  // Estado simplificado - eliminado todo lo relacionado con redimensionamiento
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const componentRef = useRef<HTMLDivElement>(null);

  // Inicio de arrastre - lógica simplificada
  const handleMouseDown = (e: React.MouseEvent) => {
    // No permitir arrastrar cuando se hace clic en elementos interactivos
    if (
      e.target instanceof HTMLInputElement || 
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('textarea')
    ) {
      return;
    }

    e.preventDefault();
    
    if (componentRef.current) {      
      const rect = componentRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      setIsDragging(true);
    }
  };

  // Manejo de movimiento - versión simple y fluida
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && componentRef.current) {
      const parentRect = componentRef.current.parentElement?.getBoundingClientRect();
      if (!parentRect) return;
      
      const newX = e.clientX - parentRect.left - dragOffset.x;
      const newY = e.clientY - parentRect.top - dragOffset.y;
      
      // Asegurar que el componente permanece dentro de los límites del padre
      const compWidth = componentRef.current.offsetWidth;
      const compHeight = componentRef.current.offsetHeight;
      
      const boundedX = Math.max(0, Math.min(newX, parentRect.width - compWidth));
      const boundedY = Math.max(0, Math.min(newY, parentRect.height - compHeight));
      
      setPosition({
        x: boundedX,
        y: boundedY
      });
    }
  };

  // Finalización de arrastre
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange(id, position);
    }
  };

  // Event listeners simplificados
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

  // Tamaño fijo para todos los componentes
  const fixedWidth = 150;

  return (
    <div
      ref={componentRef}
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${fixedWidth}px`,
        zIndex: isDragging ? 10 : 1,
        // Solo el fondo visible en hover o durante interacciones
        backgroundColor: isHovered || isDragging ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
        border: isHovered || isDragging ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
        borderRadius: '6px',
        transition: isDragging ? 'none' : 'background-color 0.2s, border 0.2s',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      {/* Contenido del componente */}
      <div className="p-2 flex flex-col items-center justify-center">
        {/* Nombre de la variable en negro negrita */}
        <div 
          className="font-bold truncate w-full text-center" 
          style={{
            color: 'black',
            textShadow: '0px 0px 2px white, 0px 0px 3px white',
            marginBottom: '2px'
          }}
        >
          {varName}
        </div>
        
        {/* Valor del componente */}
        <div 
          className="w-full flex justify-center font-bold" 
          style={{
            color: 'black',
            textShadow: '0px 0px 2px white, 0px 0px 3px white'
          }}
        >
          {children}
        </div>
      </div>
      
      {/* Botón de eliminar (aparece solo al hover) */}
      {isHovered && (
        <button 
          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity"
          onClick={() => onRemove(id)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ScadaDraggableComponent;
