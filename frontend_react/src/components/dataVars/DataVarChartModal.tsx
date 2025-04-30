import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Chart from '@/components/dashboard/Chart';
import ScrollableChart from './ScrollableChart';
import { useParams } from "react-router-dom";

type DataVarChartModalProps = {
  show: boolean;
  onClose: () => void;
  dataVar: any;
  dataName: string;
  dataId: string;
  timeId: string;
}

function DataVarChartModal({ show, onClose, dataVar, dataName, dataId, timeId }: DataVarChartModalProps) {
  const [viewMode, setViewMode] = useState<'standard' | 'scrollable'>('scrollable');
  const [showIds, setShowIds] = useState(false);
  const [showApiUrls, setShowApiUrls] = useState(false);

  const params = useParams();
  const projectId = params.projectId!;
  
  // Get API base URL from environment variable
  const apiBaseUrl = import.meta.env.VITE_API_URL;
  
  // Create API URLs for data and time arrays
  const dataApiUrl = `${apiBaseUrl}/projects/${projectId}/datavars/${dataId}`;
  const timeApiUrl = timeId && timeId !== 'No time vector found' 
    ? `${apiBaseUrl}/projects/${projectId}/datavars/${timeId}`
    : '';
  
  // Create a data object structure similar to what Chart component expects
  const chartData: any = {
    [dataName]: dataVar,
    [`${dataName}_time`]: [] // Will be populated if we find the time vector
  };

  // Try to find the corresponding time vector in localStorage
  const storageKey = `${dataName}_time_vector`;
  const timeVectorJSON = localStorage.getItem(storageKey);
  
  if (timeVectorJSON) {
    try {
      chartData[`${dataName}_time`] = JSON.parse(timeVectorJSON);
    } catch (e) {
      console.error("Error parsing time vector from localStorage:", e);
    }
  } else {
    // If no specific time vector, generate simple sequential timestamps
    const now = Date.now();
    for (let i = 0; i < dataVar.length; i++) {
      chartData[`${dataName}_time`].push(now - (dataVar.length - i - 1) * 1000);
    }
    
    // Store for future use
    localStorage.setItem(storageKey, JSON.stringify(chartData[`${dataName}_time`]));
  }

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-[#120d18] text-left align-middle shadow-xl transition-all p-8">
                {/* Header with title and view toggle buttons */}
                <div className="border-l-4 border-[#FFFF44] pl-5 mb-6">
                  <Dialog.Title
                    as="h3"
                    className="font-black text-3xl text-white mb-2"
                  >
                    {dataName}
                  </Dialog.Title>
                  <p className="text-gray-400">
                    Visualización gráfica de datos almacenados
                  </p>
                </div>
                
                {/* Controls */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="bg-gray-800/50 p-2 rounded-lg inline-flex gap-2">
                    <button
                      onClick={() => setViewMode('standard')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'standard' 
                        ? 'bg-[#FFFF44] text-black' 
                        : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    >
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Últimos 30
                      </span>
                    </button>
                    <button
                      onClick={() => setViewMode('scrollable')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'scrollable' 
                        ? 'bg-[#FFFF44] text-black' 
                        : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    >
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                        Histórico
                      </span>
                    </button>
                  </div>
                  
                  <div className="bg-gray-800/50 p-2 rounded-lg inline-flex gap-2">
                    <button
                      onClick={() => setShowIds(!showIds)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${showIds 
                        ? 'bg-[#FFFF44] text-black' 
                        : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                      title="Mostrar IDs de MongoDB"
                    >
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        IDs
                      </span>
                    </button>
                    <button
                      onClick={() => setShowApiUrls(!showApiUrls)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${showApiUrls 
                        ? 'bg-[#FFFF44] text-black' 
                        : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                      title="Mostrar URLs de API"
                    >
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        API URLs
                      </span>
                    </button>
                  </div>
                </div>
                
                {/* Database IDs display */}
                {showIds && (
                  <div className="bg-gray-800/80 rounded-lg p-4 mb-4">
                    <h4 className="text-gray-300 text-sm font-medium mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      Identificadores de MongoDB
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-900/60 p-3 rounded">
                        <div className="text-gray-400 text-xs mb-1">ID Datos:</div>
                        <code className="text-[#FFFF44] font-mono text-sm break-all">{dataId}</code>
                      </div>
                      <div className="bg-gray-900/60 p-3 rounded">
                        <div className="text-gray-400 text-xs mb-1">ID Vector Tiempo:</div>
                        <code className="text-[#FFFF44] font-mono text-sm break-all">{timeId}</code>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* API URLs display */}
                {showApiUrls && (
                  <div className="bg-gray-800/80 rounded-lg p-4 mb-4">
                    <h4 className="text-gray-300 text-sm font-medium mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      URLs para acceso API REST
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-900/60 p-3 rounded">
                        <div className="text-gray-400 text-xs mb-1">GET Datos:</div>
                        <a 
                          href={dataApiUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#FFFF44] font-mono text-sm break-all hover:underline block"
                        >
                          {dataApiUrl}
                        </a>
                      </div>
                      
                      {timeApiUrl && (
                        <div className="bg-gray-900/60 p-3 rounded">
                          <div className="text-gray-400 text-xs mb-1">GET Vector Tiempo:</div>
                          <a 
                            href={timeApiUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#FFFF44] font-mono text-sm break-all hover:underline block"
                          >
                            {timeApiUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Chart container with styled border */}
                <div className="mt-4 bg-[#1a1625] border border-gray-800 rounded-lg p-1" style={{ height: '500px' }}>
                  {viewMode === 'standard' ? (
                    <Chart selectedVar={dataName} gVar={chartData} />
                  ) : (
                    <ScrollableChart selectedVar={dataName} gVar={chartData} />
                  )}
                </div>

                {/* Footer with close button */}
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="bg-[#FFFF44] text-black font-bold px-6 py-2.5 rounded-lg hover:bg-yellow-300 transition-colors shadow-md flex items-center"
                    onClick={onClose}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default DataVarChartModal;
