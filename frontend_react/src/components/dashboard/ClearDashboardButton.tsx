import React, { useState } from 'react';

interface ClearDashboardButtonProps {
  onClear: () => void;
}

function ClearDashboardButton({ onClear }: ClearDashboardButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onClear();
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      {showConfirm ? (
        <div className="flex items-center gap-2">
          <span className="text-white">¿Estás seguro?</span>
          <button
            onClick={handleConfirm}
            className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-xl font-bold"
          >
            Confirmar
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-xl font-bold"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={handleClearClick}
          className="bg-red-500 text-white hover:bg-red-600 px-6 py-3 rounded-xl font-bold flex items-center"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
            />
          </svg>
          Limpiar dashboard
        </button>
      )}
    </>
  );
}

export default ClearDashboardButton;
