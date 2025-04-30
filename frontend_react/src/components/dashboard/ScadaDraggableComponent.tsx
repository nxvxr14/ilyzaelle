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
  onFontSizeChange?: (id: string, factor: number) => void; // Nueva función para actualizar el tamaño de fuente
  fontSizeFactor?: number; // Nuevo prop para recibir el factor inicial
  children: React.ReactNode;
  varName: string;
}

const ScadaDraggableComponent: React.FC<ScadaDraggableComponentProps> = ({
  id,
  initialPosition,
  onPositionChange,
  onRemove,
  onFontSizeChange,
  fontSizeFactor: initialFontSize = 1.0, // Valor por defecto si no se proporciona
  children,
  varName
}) => {
  // Estado simplificado para arrastre
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const componentRef = useRef<HTMLDivElement>(null);
  
  // Usar el factor de escala proporcionado por props o el valor por defecto
  const [fontSizeFactor, setFontSizeFactor] = useState<number>(initialFontSize);

  // Actualizar fontSizeFactor cuando cambia en props
  useEffect(() => {
    setFontSizeFactor(initialFontSize);
  }, [initialFontSize]);

  // Funciones para incrementar y decrementar el tamaño de la fuente
  const increaseFontSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFactor = Math.min(fontSizeFactor + 0.2, 2.0);
    setFontSizeFactor(newFactor);
    
    // Notificar al componente padre del cambio
    if (onFontSizeChange) {
      onFontSizeChange(id, newFactor);
    }
  };

  const decreaseFontSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFactor = Math.max(fontSizeFactor - 0.2, 0.6);
    setFontSizeFactor(newFactor);
    
    // Notificar al componente padre del cambio
    if (onFontSizeChange) {
      onFontSizeChange(id, newFactor);
    }
  };

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
  
  // Calcular tamaños de fuente basados en el factor
  const titleFontSize = `${13 * fontSizeFactor}px`;
  const valueFontSize = `${14 * fontSizeFactor}px`;

  // Crear un estilo con el factor de escala para pasarlo a los hijos
  const scaleStyle = {
    fontSize: valueFontSize,
    transform: `scale(${fontSizeFactor})`,
    transformOrigin: 'center center'
  };

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
            marginBottom: '2px',
            fontSize: titleFontSize // Usar el tamaño calculado
          }}
        >
          {varName}
        </div>
        
        {/* Valor del componente */}
        <div 
          className="w-full flex justify-center font-bold" 
          style={{
            color: 'black',
            textShadow: '0px 0px 2px white, 0px 0px 3px white',
            fontSize: valueFontSize // Usar el tamaño calculado
          }}
        >
          {React.Children.map(children, child => {
            // Clonar el hijo y añadir el fontSizeFactor como prop
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { fontSizeFactor });
            }
            return child;
          })}
        </div>
      </div>
      
      {/* Controles que aparecen al hacer hover */}
      {isHovered && (
        <div className="absolute top-1 right-1 flex gap-1">
          {/* Botón de disminuir fuente */}
          <button 
            className="w-5 h-5 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity"
            onClick={decreaseFontSize}
            title="Reducir tamaño de texto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Botón de aumentar fuente */}
          <button 
            className="w-5 h-5 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity"
            onClick={increaseFontSize}
            title="Aumentar tamaño de texto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Botón de eliminar */}
          <button 
            className="w-5 h-5 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity"
            onClick={() => onRemove(id)}
            title="Eliminar componente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ScadaDraggableComponent;
