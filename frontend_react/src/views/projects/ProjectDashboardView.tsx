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
    // Use '!' to assert that the value will always be present in the params
    const projectId = params.projectId!;

    //  para enviar el server que se recibe en cada proyecto hacia el socket

    const { socket, setServerAPI } = useContext(SocketContext);
    const [gVarData, setGVarData] = useState<any>(null);

    const { data, isLoading, isError } = useQuery({
        // se usa projectid en querykey para que sean unicos, no quede cacheado y no haya problemas mas adelante
        queryKey: ['project', projectId],
        //cuando tengo una funcion que toma un parametro debo tener un callback
        queryFn: () => getProjectById(projectId),
    })

    useEffect(() => {
        if (socket) {
            // Unirse al room del proyecto
            const interval = setInterval(() => {
                socket.emit('request-gVar-update-f-b', projectId);
            }, 500);

            // Escuchar actualizaciones de gVar
            const handleUpdateGVar = (gVarData: object) => {
                setGVarData(gVarData);
            };

            socket.on('response-gVar-update-b-f', handleUpdateGVar);

            return () => {
                console.log('desmontando timer')
                clearInterval(interval);
                socket.off('response-gVar-update-b-f', handleUpdateGVar);
            };
        }
    }, [socket]);

    // Usamos useEffect para evitar setServer dentro del render
    useEffect(() => {
        if (data) {
            setServerAPI(data.serverAPIKey);
        }
    }, [data, setServerAPI]);
    // Ejecutamos el efecto solo cuando data cambie
    // la mayoria de problmas de typscript se generan por tipo de dato
    // como socket no obtiene un valor hasta que la data se obtenga toca definir el useState como un objeto socket o null, de esta manera ts no tira error pero js permitiria el funcionamiento, es diferente el maneo a statuslocalmodal

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse text-2xl font-bold text-gray-600">Cargando proyecto...</div>
        </div>
    )

    if (isError) return <Navigate to='/404' />

    // Render the dashboard when data is available
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
                            <p className="text-sm text-indigo-600 font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                                <span className="font-semibold">Server:</span> <span className="ml-1 font-mono">{data.server}</span>
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

            <DashboardZoneView gVarData={gVarData} />
        </div>
    );

    return null;
};

export default ProjectDashboardView;


