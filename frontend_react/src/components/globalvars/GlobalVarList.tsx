import { SocketContext } from "@/context/SocketContext";
import { useContext, useState } from "react";
import { useGlobalVarActionsModal } from "./ActionsGlobalVarsModal";
import { useNavigate, useParams } from "react-router-dom";
import SaveGlobalVarModal from "./SaveGlobalVarModal";

type GlobalVarListProps = {
  gVarData: any;
  onAddChart: (selectedVar: string) => void;
  onAddLabel: (selectedVar: string) => void;
  onAddInput: (selectedVar: string) => void;
  onAddToggle: (selectedVar: string) => void; // New prop for handling toggle component
  projectId?: string;
  serverAPIKey?: string;
}

function GlobalVarList({ 
  gVarData, 
  onAddChart, 
  onAddLabel, 
  onAddInput, 
  onAddToggle,
  projectId,
  serverAPIKey
}: GlobalVarListProps) {
  const params = useParams();
  const navigate = useNavigate();
  const projectIdToUse = params.projectId || projectId!;

  const { socket } = useContext(SocketContext);
  const [selectedKey, setSelectedKey] = useState<string>('');
  // Update to pass serverAPIKey to handleDelete
  const { handleDelete } = useGlobalVarActionsModal({ 
    socket, 
    projectId: projectIdToUse,
    serverAPIKey
  });

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSave = (key: string) => {
    setSelectedKey(key);
    navigate(location.pathname + '?saveGlobalVar=true')
    // console.log(`Guardando variable: ${key}`);
    // if (socket) {
    //     socket.emit('save-variable', projectId, key);
    // }
  }

  const getFormattedValue = (value: any) => {
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (Array.isArray(value)) {
      return value[value.length - 1];
    }
    return value;
  };

  // Filter out keys that end with _time
  const filteredKeys = Object.keys(gVarData || {}).filter(key => !key.endsWith('_time'));

  // Calculate pagination values
  const totalItems = filteredKeys.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get current page items
  const currentItems = filteredKeys.slice(startIndex, endIndex);

  if (!gVarData) return (
    <div className="w-full p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
      <p className="text-xl font-medium">No hay variables disponibles</p>
    </div>
  )

  return (
    <>
      <SaveGlobalVarModal
        nameGlobalVar={selectedKey}
        gVar={gVarData[selectedKey]}
      />
      <div className="w-full flex flex-col">
        <div className="overflow-hidden shadow-lg rounded-xl border border-gray-200">
          {gVarData && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Nombre Variable
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Tipo Variable
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Valor Actual
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((key) => {
                  const varType = Array.isArray(gVarData[key]) ? 'array' : typeof gVarData[key];
                  const size = Array.isArray(gVarData[key]) ? gVarData[key].length : '-';
                  return (
                    <tr key={key} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{key}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${varType === 'array' ? 'bg-blue-100 text-blue-800' : 
                          varType === 'boolean' ? 'bg-purple-100 text-purple-800' :
                          varType === 'number' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                          {varType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">{getFormattedValue(gVarData[key])}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-center gap-2">
                          {(Array.isArray(gVarData[key])) && (
                            <>
                              <button
                                onClick={() => handleSave(key)}
                                className="inline-flex items-center px-3 py-1.5 rounded bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs font-medium transition-colors"
                                title="Guardar Registro"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                Guardar
                              </button>
                              
                              <button
                                onClick={() => onAddChart(key)}
                                className="inline-flex items-center px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors"
                                title="Añadir Gráfico"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Gráfico
                              </button>
                            </>
                          )}
                          
                          {(typeof gVarData[key] === 'boolean' || typeof gVarData[key] === 'number') && (
                            <button
                              onClick={() => onAddLabel(key)}
                              className="inline-flex items-center px-3 py-1.5 rounded bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium transition-colors"
                              title="Añadir Etiqueta"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              Etiqueta
                            </button>
                          )}
                          
                          {(typeof gVarData[key] === 'number') && (
                            <button
                              onClick={() => onAddInput(key)}
                              className="inline-flex items-center px-3 py-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors"
                              title="Añadir Input"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Input
                            </button>
                          )}
                          
                          {(typeof gVarData[key] === 'boolean') && (
                            <button
                              onClick={() => onAddToggle(key)}
                              className="inline-flex items-center px-3 py-1.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium transition-colors"
                              title="Añadir Toggle"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              Toggle
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDelete(key)}
                            className="inline-flex items-center px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors"
                            title="Reiniciar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Reiniciar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls mejorados */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-3 mt-6 pb-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
            
            <span className="text-sm text-gray-700 font-medium">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              Siguiente
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default GlobalVarList;