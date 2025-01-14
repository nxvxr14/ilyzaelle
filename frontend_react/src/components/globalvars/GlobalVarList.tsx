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
}

function GlobalVarList({ gVarData, onAddChart, onAddLabel, onAddInput }: GlobalVarListProps) {
  const params = useParams();
  const navigate = useNavigate()
  // Use '!' to assert that the value will always be present in the params
  const projectId = params.projectId!;

  const { socket } = useContext(SocketContext);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const { handleDelete } = useGlobalVarActionsModal({ socket, projectId });

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

  // Calculate pagination values
  const totalItems = Object.keys(gVarData || {}).length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get current page items
  const currentItems = Object.keys(gVarData || {}).slice(startIndex, endIndex);

  if (!gVarData) return (
    <div className="w-full p-4 text-center text-gray-500">vacio...</div>
  )

  return (
    <>
      <SaveGlobalVarModal
        nameGlobalVar={selectedKey}
        gVar={gVarData[selectedKey]}
      />
      <div className="w-full flex flex-col">
        <div className="overflow-x-auto shadow-md rounded-lg">
          {gVarData && (
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre Variable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Variable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Actual
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((key) => (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof gVarData[key]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getFormattedValue(gVarData[key])}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      <div className="flex justify-center space-x-2">
                        {(Array.isArray(gVarData[key])) && (
                          <>
                            <button
                              onClick={() => handleSave(key)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors duration-200"
                            >
                              <span className="text-orange-600 font-semibold">R</span>
                            </button>
                            <button
                              onClick={() => onAddChart(key)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors duration-200"
                            >
                              <span className="text-orange-600 font-semibold">G</span>
                            </button>
                          </>
                        )}
                        {(typeof gVarData[key] === 'boolean' || typeof gVarData[key] === 'number') && (
                          <button
                            onClick={() => onAddLabel(key)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors duration-200"
                          >
                            <span className="text-orange-600 font-semibold">L</span>
                          </button>
                        )}
                        {(typeof gVarData[key] === 'number') && (
                          <button
                            onClick={() => onAddInput(key)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors duration-200"
                          >
                            <span className="text-orange-600 font-semibold">I</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(key)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-colors duration-200"
                        >
                          <span className="text-red-600 font-semibold">X</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-4 pb-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors duration-200"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors duration-200"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default GlobalVarList;