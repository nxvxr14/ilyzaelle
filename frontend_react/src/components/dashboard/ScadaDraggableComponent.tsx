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
  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size>({ width: 200, height: 'auto' });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState<Position>({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState<Size>({ width: 200, height: 100 });
  const componentRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [parentSize, setParentSize] = useState<{ width: number, height: number } | null>(null);
  const [relativePosition, setRelativePosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Calcula la escala de fuente basada en el ancho del componente
  const getFontSize = () => {
    const baseSize = 14;
    const scaleFactor = Math.max(0.7, Math.min(1.5, size.width / 200));
    return `${baseSize * scaleFactor}px`;
  };

  useEffect(() => {
    // Guarda el padre como referencia para cálculos de posición relativa
    if (componentRef.current) {
      parentRef.current = componentRef.current.parentElement;
      if (parentRef.current) {
        const parentWidth = parentRef.current.clientWidth;
        const parentHeight = parentRef.current.clientHeight;
        setParentSize({ width: parentWidth, height: parentHeight });
        
        // Calcula la posición relativa (porcentaje)
        setRelativePosition({
          x: position.x / parentWidth,
          y: position.y / parentHeight
        });
      }
    }
  }, [position]);

  // Actualiza la posición cuando cambia el tamaño del padre
  useEffect(() => {
    const handleResize = () => {
      if (parentRef.current) {
        const newParentWidth = parentRef.current.clientWidth;
        const newParentHeight = parentRef.current.clientHeight;
        
        // Si el tamaño del padre ha cambiado, actualiza la posición basada en el porcentaje
        if (parentSize && (parentSize.width !== newParentWidth || parentSize.height !== newParentHeight)) {
          const newX = relativePosition.x * newParentWidth;
          const newY = relativePosition.y * newParentHeight;
          
          setPosition({
            x: newX,
            y: newY
          });
          
          setParentSize({ width: newParentWidth, height: newParentHeight });
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [relativePosition, parentSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
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

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && componentRef.current && parentRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();
      const newX = e.clientX - parentRect.left - dragOffset.x;
      const newY = e.clientY - parentRect.top - dragOffset.y;
      
      // Ensure component stays within parent bounds
      const compWidth = componentRef.current.offsetWidth;
      const compHeight = componentRef.current.offsetHeight;
      
      const boundedX = Math.max(0, Math.min(newX, parentRect.width - compWidth));
      const boundedY = Math.max(0, Math.min(newY, parentRect.height - compHeight));
      
      setPosition({
        x: boundedX,
        y: boundedY
      });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const newWidth = Math.max(100, initialSize.width + deltaX);
      
      setSize({
        width: newWidth,
        height: 'auto' // Let height adjust automatically
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange(id, position);
    }
    if (isResizing) {
      setIsResizing(false);
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  return (
    <div
      ref={componentRef}
      className={`absolute rounded-md overflow-hidden ${
        isDragging ? 'cursor-grabbing opacity-90' : 'opacity-100'
      } shadow-lg`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: size.height !== 'auto' ? `${size.height}px` : 'auto',
        zIndex: isDragging || isResizing ? 10 : 1,
        transition: 'box-shadow 0.2s',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div 
        className="flex justify-between items-center p-2 bg-gradient-to-r from-gray-800 to-gray-900 cursor-grab"
        onMouseDown={handleMouseDown}
      >
        <div className="text-yellow-400 font-medium truncate" style={{ fontSize: getFontSize() }}>
          {varName}
        </div>
        <button 
          className="text-gray-400 hover:text-red-400 focus:outline-none"
          onClick={() => onRemove(id)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-2" style={{ fontSize: getFontSize() }}>
        {children}
      </div>
      
      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-500 opacity-60 hover:opacity-100 cursor-se-resize"
        onMouseDown={handleResizeStart}
      ></div>
    </div>
  );
};

export default ScadaDraggableComponent;
