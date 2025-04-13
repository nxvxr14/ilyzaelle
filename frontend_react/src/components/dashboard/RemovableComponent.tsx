import React from "react";
import EditableTitle from "./EditableTitle";

interface RemovableComponentProps {
  children: React.ReactNode;
  onRemove: () => void;
  title: string;
  onTitleChange: (newTitle: string) => void;
}

function RemovableComponent({ children, onRemove, title, onTitleChange }: RemovableComponentProps) {
  return (
    <div className="relative">
      <button
        className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
        onClick={onRemove}
        title="Eliminar Componente"
      >
        ✕
      </button>
      
      <EditableTitle title={title} onTitleChange={onTitleChange} />
      
      <div className="p-2">
        {children}
      </div>
    </div>
  );
}

export default RemovableComponent;
