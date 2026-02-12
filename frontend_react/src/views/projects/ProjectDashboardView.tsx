import { getProjectById } from "@/api/ProjectApi";
import StatusLocalModal from "@/components/projects/StatusLocalModal";
import { SocketContext } from "@/context/SocketContext";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import DashboardZoneView from "../dashboard/DashboardZoneView";
import StatusBoardLocalModal from "@/components/boards/StatusBoardLocalModal";

const ProjectDashboardView = () => {
    const params = useParams();
    const projectId = params.projectId!;

    const { socket, setServerAPI } = useContext(SocketContext);
    const [gVarData, setGVarData] = useState<any>(null);
    const [serverAPIKey, setServerAPIKeyLocal] = useState<string>("");

    const { data, isLoading, isError } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => getProjectById(projectId),
    });

    useEffect(() => {
        if (data) {
            // Guardar la API key para usarla en las solicitudes de socket
            setServerAPI(data.serverAPIKey);
            setServerAPIKeyLocal(data.serverAPIKey);
        }
    }, [data, setServerAPI]);

    useEffect(() => {
        if (socket && serverAPIKey) {
            let intervalId: NodeJS.Timeout;
            
            // Manejar respuestas del servidor
            const handleUpdateGVar = (gVarData: object, responseServerAPIKey: string) => {
                // Solo actualizar si la respuesta es del servidor que nos interesa
                if (responseServerAPIKey === serverAPIKey) {
                    setGVarData(gVarData);
                }
            };

            // Escuchar el evento para cuando no hay servidor disponible
            const handleNoServer = (data: any) => {
                // Puedes mostrar un mensaje al usuario o establecer un estado
            };

            // Registrar listeners
            socket.on('response-gVar-update-b-f', handleUpdateGVar);
            socket.on('no-server-available', handleNoServer);

            // Iniciar el intervalo para solicitar actualizaciones
            intervalId = setInterval(() => {
                socket.emit('request-gVar-update-f-b', projectId, serverAPIKey);
            }, 500);

            // Cleanup function
            return () => {
                clearInterval(intervalId);
                socket.off('response-gVar-update-b-f', handleUpdateGVar);
                socket.off('no-server-available', handleNoServer);
            };
        }
        
        return () => {
            // Nada que limpiar si no hay socket o serverAPIKey
        };
    }, [socket, projectId, serverAPIKey]);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse text-2xl font-bold text-gray-600">Cargando proyecto...</div>
        </div>
    );

    if (isError) return <Navigate to='/404' />;

    if (data) return (
        <div className="container mx-auto px-4 py-8">
            {/* Project Header Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
                <div className="p-6">
                    {/* Status indicator */}
                    <div className="mb-4">
                        <StatusLocalModal boards={data.boards} server={data.server} />
                    </div>

                    {/* Project Information Card */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
                                {data.projectName}
                            </h1>
                            <p className="text-xl font-light text-gray-500 mb-4">
                                {data.description}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100 w-full md:w-auto">
                            <p className="text-sm text-emerald-600 font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                <span className="font-semibold">Gateway API key:</span> <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded">{data.serverAPIKey}</span>
                            </p>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        <Link
                            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-bold px-8 py-3 text-lg cursor-pointer transition-all rounded-xl shadow-sm hover:shadow-md flex items-center gap-2"
                            to={`/projects/${projectId}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver
                        </Link>
                    </div>
                </div>
            </div>

            <DashboardZoneView 
                gVarData={gVarData} 
                projectId={projectId}
                serverAPIKey={serverAPIKey}
            />
        </div>
    );

    return null;
};

export default ProjectDashboardView;


