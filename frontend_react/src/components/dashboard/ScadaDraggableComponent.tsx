import React, { useState, useRef, useEffect } from 'react';

type Position = {
  x: number;
  y: number;
};

// Modificar el tipo Size para permitir tanto números como 'auto'
type Size = {
  width: number;
  height: number | 'auto'; // Permitir 'auto' como valor válido
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
  // IMPORTANTE: Usar un useRef para mantener la posición inicial solo al montar el componente
  const initialLoadDone = useRef(false);

  const [position, setPosition] = useState<Position>({
    x: initialPosition?.x || 50,
    y: initialPosition?.y || 50
  });
  
  // Estado para el tamaño con altura inicial como número
  const [size, setSize] = useState<Size>({ width: 150, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState<Position>({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState<Size>({ width: 150, height: 100 });
  const componentRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLElement | null>(null);

  // Solo sincronizar posición desde props en el primer renderizado
  useEffect(() => {
    if (!initialLoadDone.current && initialPosition) {
      setPosition({
        x: initialPosition.x,
        y: initialPosition.y
      });
      initialLoadDone.current = true;
    }
  }, []);

  // Calcular factores de escala basados en el tamaño del componente
  const getScaleFactor = () => {
    const widthFactor = Math.max(0.7, Math.min(2.0, size.width / 150));
    const heightFactor = typeof size.height === 'number' 
      ? Math.max(0.7, Math.min(2.0, size.height / 100))
      : 1;
      
    // Usar el factor menor para mantener proporciones
    return Math.min(widthFactor, heightFactor);
  };
  
  // Escala de fuente para texto normal
  const getFontSize = () => {
    const baseSize = 13;
    return `${baseSize * getScaleFactor()}px`;
  };
  
  // Escala de fuente para título
  const getTitleFontSize = () => {
    const baseSize = 11;
    return `${baseSize * getScaleFactor()}px`;
  };

  // Inicio de arrastre
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
      parentRef.current = componentRef.current.parentElement;
      
      const rect = componentRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      setIsDragging(true);
    }
  };

  // Inicio de redimensionamiento
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
    
    if (componentRef.current) {
      // Guardar el tamaño actual como números para poder redimensionar
      setInitialSize({ 
        width: componentRef.current.offsetWidth,
        height: componentRef.current.offsetHeight 
      });
    }
  };

  // Manejo de movimiento de ratón para arrastre o redimensionamiento
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && componentRef.current && parentRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();
      
      // Calcular la nueva posición
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
    else if (isResizing && componentRef.current) {
      // Redimensionar el componente en ambas dimensiones
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      // Calcular nuevas dimensiones con límites mínimos
      const newWidth = Math.max(100, initialSize.width + deltaX);
      const newHeight = Math.max(50, 
        typeof initialSize.height === 'number' ? initialSize.height + deltaY : 100 + deltaY
      );
      
      // Actualizar el tamaño
      setSize({
        width: newWidth,
        height: newHeight // Ahora usamos el alto calculado
      });
    }
  };

  // Finalización de arrastre o redimensionamiento
  const handleMouseUp = () => {
    if (isDragging) {
      // Notificar la posición final al padre
      const finalPosition = { 
        x: position.x,
        y: position.y
      };
      
      setIsDragging(false);
      onPositionChange(id, finalPosition);
    }
    
    if (isResizing) {
      setIsResizing(false);
    }
  };

  // Agregar y quitar event listeners según el estado
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, position]);

  // Preparar el valor de altura para CSS
  const heightStyle = size.height === 'auto' ? 'auto' : `${size.height}px`;
  
  // Calcular la escala para transformar el contenido
  const contentScale = getScaleFactor();

  return (
    <div
      ref={componentRef}
      className={`absolute rounded-md overflow-hidden ${
        isDragging ? 'cursor-grabbing opacity-90' : 'opacity-100'
      } shadow-lg transition-colors`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: heightStyle, // Usar el valor formateado
        zIndex: isDragging || isResizing ? 10 : 1,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        border: isHovered ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      {/* Contenedor principal con transformación para escalar todo el contenido */}
      <div 
        className="w-full h-full flex flex-col items-center justify-center"
        style={{
          transform: `scale(${contentScale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Variable name (centered) */}
        <div className="text-yellow-400 font-medium truncate w-full text-center mb-2" 
          style={{ fontSize: getTitleFontSize() }}
        >
          {varName}
        </div>
        
        {/* Component content (children) with dynamic sizing */}
        <div className="w-full flex justify-center">
          {children}
        </div>
      </div>
      
      {/* Resize handle (bottom right corner) */}
      <div
        className="absolute bottom-0 right-0 w-5 h-5 bg-yellow-500 opacity-40 hover:opacity-100 cursor-se-resize flex items-center justify-center"
        onMouseDown={handleResizeStart}
      >
        <svg width="8" height="8" viewBox="0 0 6 6">
          <path d="M0 6L6 6L6 0" fill="white" opacity="0.8" />
        </svg>
      </div>
      
      {/* Remove button (appears on hover) */}
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
