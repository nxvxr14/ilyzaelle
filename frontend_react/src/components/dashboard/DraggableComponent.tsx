import React, { useState, useRef, useEffect } from 'react';

type Position = {
  x: number;
  y: number;
};

interface DraggableComponentProps {
  id: string;
  initialPosition: Position;
  onPositionChange: (id: string, position: Position) => void;
  onRemove: (id: string) => void;
  children: React.ReactNode;
  title: string;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  id,
  initialPosition,
  onPositionChange,
  onRemove,
  children,
  title
}) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const componentRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (componentRef.current) {
      const rect = componentRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && componentRef.current) {
      const parentRect = componentRef.current.parentElement?.getBoundingClientRect();
      if (parentRect) {
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
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange(id, position);
    }
  };

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

  return (
    <div
      ref={componentRef}
      className={`absolute bg-[#1a1625]/80 backdrop-blur-sm rounded-lg border-2 ${
        isDragging ? 'border-yellow-400 cursor-grabbing' : 'border-gray-700 hover:border-gray-500 cursor-grab'
      } overflow-hidden p-2 shadow-lg`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '200px',
        zIndex: isDragging ? 10 : 1
      }}
    >
      <div 
        className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2 bg-[#120d18] rounded-t-lg -m-2 p-2"
        onMouseDown={handleMouseDown}
      >
        <div className="font-medium text-gray-300 text-sm truncate">{title}</div>
        <button 
          className="text-gray-500 hover:text-red-500 focus:outline-none transition-colors"
          onClick={() => onRemove(id)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="mt-2">
        {children}
      </div>
    </div>
  );
};

export default DraggableComponent;
