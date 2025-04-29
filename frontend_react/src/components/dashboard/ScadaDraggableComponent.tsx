import React, { useState, useRef, useEffect } from 'react';

type Position = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
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
  const [size, setSize] = useState<Size>({ width: 150, height: 'auto' });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState<Position>({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState<Size>({ width: 150, height: 100 });
  const componentRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);

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

  // Calcula la escala de fuente basada en el ancho del componente
  const getFontSize = () => {
    const baseSize = 13;
    const scaleFactor = Math.max(0.7, Math.min(1.7, size.width / 150));
    return `${baseSize * scaleFactor}px`;
  };
  
  // Calcula el tamaño del título
  const getTitleFontSize = () => {
    const baseSize = 11;
    const scaleFactor = Math.max(0.7, Math.min(1.7, size.width / 150));
    return `${baseSize * scaleFactor}px`;
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
      // Redimensionar el componente
      const deltaX = e.clientX - resizeStart.x;
      const newWidth = Math.max(100, initialSize.width + deltaX);
      
      setSize({
        width: newWidth,
        height: 'auto' 
      });
    }
  };

  // Finalización de arrastre o redimensionamiento
  const handleMouseUp = () => {
    if (isDragging) {
      // Notificar la posición final al padre - clonar el objeto para evitar referencia
      const finalPosition = { 
        x: position.x,
        y: position.y
      };
      
      setIsDragging(false);
      // Notificar cambio inmediatamente
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
        height: size.height !== 'auto' ? `${size.height}px` : 'auto',
        zIndex: isDragging || isResizing ? 10 : 1,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        border: isHovered ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      {/* Variable name (centered) */}
      <div className="p-2 flex flex-col items-center">
        <div 
          className="text-yellow-400 font-medium truncate w-full text-center" 
          style={{ fontSize: getTitleFontSize() }}
        >
          {varName}
        </div>
        
        {/* Component content (children) with dynamic sizing */}
        <div className="w-full flex justify-center mt-1" style={{ fontSize: getFontSize() }}>
          {children}
        </div>
      </div>
      
      {/* Resize handle (bottom right corner) */}
      <div
        className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 opacity-40 hover:opacity-100 cursor-se-resize"
        onMouseDown={handleResizeStart}
      ></div>
      
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
