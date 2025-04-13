import React, { useState, useRef, useEffect } from "react";

interface EditableTitleProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
}

function EditableTitle({ title, onTitleChange }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when entering edit mode
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onTitleChange(editableTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onTitleChange(editableTitle);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditableTitle(title);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTitle(e.target.value);
  };

  return (
    <div className="text-center py-2 mb-2 border-b border-gray-600">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editableTitle}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full text-center px-2 py-1 bg-[#1a1425] text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      ) : (
        <h3 
          onClick={handleClick} 
          className="font-bold text-lg text-white cursor-pointer px-2 py-1"
          title="Click para editar"
        >
          {title}
        </h3>
      )}
    </div>
  );
}

export default EditableTitle;
