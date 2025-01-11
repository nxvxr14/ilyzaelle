import { useParams } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteDataVar } from "@/api/DataVarApi";

function DataVarList({ dataVars }: { dataVars: any[] }) {
    const params = useParams();
    const projectId = params.projectId!;

    const queryClient = useQueryClient()

    const { mutate } = useMutation({
        mutationFn: deleteDataVar,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            if (data) {
                toast.success(`Variable eliminada: ${data.nameData}`);
                queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            }
        }
    })

    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Calculate pagination values
    const totalItems = dataVars?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Get current page items
    const currentItems = dataVars?.slice(startIndex, endIndex) || [];

    // Handle delete button click
    const handleDelete = (dataVarId: string) => {
        mutate({ projectId, dataVarId });
    }

    if (!dataVars || dataVars.length === 0) return (
        <div className="w-full p-4 text-center text-gray-500">vacio...</div>
    )

    return (
        <div className="w-full flex flex-col">
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variable
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha Creación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tamaño
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.nameData}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.nameGlobalVar}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.gVar.length}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors duration-200"
                                        >
                                            <span className="text-orange-600 font-semibold">S</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
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
            {/* Raw DATA */}
            {/* <div className="mt-4 p-4 bg-gray-100 rounded-lg overflow-x-auto">
                <h3 className="text-lg font-semibold mb-2">Raw gVar Data:</h3>
                <pre className="whitespace-pre-wrap">
                    {dataVars.map((item, index) => (
                        <div key={index}>
                            {JSON.stringify(item.gVar)}
                        </div>
                    ))}
                </pre>
            </div> */}
        </div>
    );
}

export default DataVarList;