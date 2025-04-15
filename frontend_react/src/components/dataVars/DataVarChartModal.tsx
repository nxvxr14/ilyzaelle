import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Chart from '@/components/dashboard/Chart';
import ScrollableChart from './ScrollableChart';

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
          <div className="fixed inset-0 bg-black/60" />
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
                <Dialog.Title
                  as="h3"
                  className="font-black text-4xl my-5 text-white flex justify-between items-center"
                >
                  <span>Gráfico: {dataName}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode('standard')}
                      className={`px-3 py-1 rounded-md text-sm ${viewMode === 'standard' 
                        ? 'bg-[#FFFF44] text-black' 
                        : 'bg-gray-700 text-white'}`}
                    >
                      Últimos 30
                    </button>
                    <button
                      onClick={() => setViewMode('scrollable')}
                      className={`px-3 py-1 rounded-md text-sm ${viewMode === 'scrollable' 
                        ? 'bg-[#FFFF44] text-black' 
                        : 'bg-gray-700 text-white'}`}
                    >
                      Histórico
                    </button>
                    <button
                      onClick={() => setShowIds(!showIds)}
                      className={`px-3 py-1 rounded-md text-sm ${showIds 
                        ? 'bg-[#FFFF44] text-black' 
                        : 'bg-gray-700 text-white'}`}
                      title="Mostrar IDs de MongoDB"
                    >
                      <span>IDs</span>
                    </button>
                  </div>
                </Dialog.Title>
                
                {/* Database IDs display */}
                {showIds && (
                  <div className="bg-gray-800 rounded-lg p-4 mb-4 text-sm">
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">ID Datos:</span>
                        <code className="text-[#FFFF44] font-mono">{dataId}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ID Vector Tiempo:</span>
                        <code className="text-[#FFFF44] font-mono">{timeId}</code>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4" style={{ height: '500px' }}>
                  {viewMode === 'standard' ? (
                    <Chart selectedVar={dataName} gVar={chartData} />
                  ) : (
                    <ScrollableChart selectedVar={dataName} gVar={chartData} />
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="bg-[#FFFF44] text-black font-bold px-6 py-2 rounded-lg"
                    onClick={onClose}
                  >
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
