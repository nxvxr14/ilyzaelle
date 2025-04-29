import { useState } from 'react';

interface ScadaBackgroundProps {
  backgroundUrl: string;
  setBackgroundUrl: (url: string) => void;
}

const ScadaBackground = ({ backgroundUrl, setBackgroundUrl }: ScadaBackgroundProps) => {
  const [inputUrl, setInputUrl] = useState(backgroundUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBackgroundUrl(inputUrl);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Ingrese URL de imagen de fondo"
            className="flex-1 p-3 border border-gray-600 rounded-lg text-gray-200 bg-[#1a1625] focus:border-yellow-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors"
          >
            Aplicar
          </button>
        </form>
      </div>
      
      <div 
        className="flex-1 relative overflow-hidden rounded-lg border border-gray-700"
        style={{
          backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '70vh'
        }}
      >
        {!backgroundUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center p-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xl">No se ha establecido un fondo</p>
              <p className="mt-2">Introduzca una URL de imagen en el campo superior</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScadaBackground;
