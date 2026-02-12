import { useParams } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteDataVar } from "@/api/DataVarApi";
import DataVarChartModal from "./DataVarChartModal";

function DataVarList({ dataVars }: { dataVars: any[] }) {
    const params = useParams();
    const projectId = params.projectId!;

    const queryClient = useQueryClient();

    // State for chart modal
    const [showChartModal, setShowChartModal] = useState(false);
    const [selectedDataVar, setSelectedDataVar] = useState<any>(null);
    const [selectedDataName, setSelectedDataName] = useState('');
    const [selectedDataId, setSelectedDataId] = useState('');
    const [selectedTimeId, setSelectedTimeId] = useState('');
    const [selectedTimeVar, setSelectedTimeVar] = useState<number[]>([]);

    // Mutation for deleting data variables
    const { mutate } = useMutation({
        mutationFn: deleteDataVar,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            if (data) {
                toast.success(`Variable eliminada: ${data.nameData}`);
            }
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        }
    });

    // Filter out time vector variables
    const filteredDataVars = dataVars?.filter(item => 
        !item.nameData.endsWith('_time') && !item.nameGlobalVar.endsWith('_time')
    ) || [];

    // Function to find time vector for a saved variable
    const findTimeVector = (dataName: string) => {
        const timeVectorName = `${dataName}_time`;
        return dataVars?.find(item => item.nameData === timeVectorName);
    };

    // Handle opening the chart modal
    const handleShowChart = (data: any) => {
        setSelectedDataVar(data.gVar);
        setSelectedDataName(data.nameGlobalVar);
        setSelectedDataId(data._id); // Store the data array ID
        
        // Find corresponding time vector and pass via props (no localStorage)
        const timeVector = findTimeVector(data.nameData);
        if (timeVector) {
            setSelectedTimeVar(timeVector.gVar);
            setSelectedTimeId(timeVector._id); // Store the time vector ID
        } else {
            setSelectedTimeVar([]);
            setSelectedTimeId('No time vector found');
        }
        
        setShowChartModal(true);
    };

    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Calculate pagination values based on filtered data
    const totalItems = filteredDataVars.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Get current page items
    const currentItems = filteredDataVars.slice(startIndex, endIndex);

    // Handle delete button click - now deletes both the variable and its time vector
    const handleDelete = (item: any) => {
        // First, delete the main data variable
        mutate({ projectId, dataVarId: item._id });
        
        // Then, check if there's a corresponding time vector and delete it too
        const timeVector = findTimeVector(item.nameData);
        if (timeVector) {
            // Small delay to avoid overwhelming the server with simultaneous requests
            setTimeout(() => {
                mutate(
                    { projectId, dataVarId: timeVector._id },
                    {
                        onSuccess: (data) => {
                            if (data) {
                                toast.info(`Vector de tiempo eliminado: ${data.nameData}`);
                            }
                            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
                        },
                        onError: () => {
                            // If there's an error deleting the time vector, don't show it to the user
                            // as the main operation (deleting the data var) succeeded
                            console.error("Error eliminando el vector de tiempo asociado");
                        }
                    }
                );
            }, 300);
        }
    }

    if (!filteredDataVars || filteredDataVars.length === 0) return (
        <div className="w-full p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-xl font-medium">No hay variables almacenadas</p>
        </div>
    )

    return (
        <div className="w-full flex flex-col">
            <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Variable
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Fecha Creación
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
                        {currentItems.map((item) => {
                            // Find time vector if it exists
                            const timeVector = findTimeVector(item.nameData);
                            
                            return (
                                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{item.nameData}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {item.nameGlobalVar}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-700">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-700">
                                            {Array.isArray(item.gVar) ? item.gVar.length : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleShowChart(item)}
                                                className="inline-flex items-center px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors"
                                                title="Ver gráfico"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                Ver gráfico
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="inline-flex items-center px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors"
                                                title="Eliminar variable"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
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

            {/* Chart Modal */}
            {selectedDataVar && (
                <DataVarChartModal 
                    show={showChartModal}
                    onClose={() => setShowChartModal(false)}
                    dataVar={selectedDataVar}
                    dataName={selectedDataName}
                    dataId={selectedDataId}
                    timeId={selectedTimeId}
                    timeVar={selectedTimeVar}
                />
            )}
        </div>
    );
}

export default DataVarList;