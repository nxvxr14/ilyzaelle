import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Chart from '@/components/dashboard/Chart';

type DataVarChartModalProps = {
  show: boolean;
  onClose: () => void;
  dataVar: any;
  dataName: string;
}

function DataVarChartModal({ show, onClose, dataVar, dataName }: DataVarChartModalProps) {
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
                  className="font-black text-4xl my-5 text-white"
                >
                  Gráfico: {dataName}
                </Dialog.Title>
                
                <div className="mt-4 h-[400px]">
                  <Chart selectedVar={dataName} gVar={chartData} />
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
