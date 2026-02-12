import { getProjectById } from "@/api/ProjectApi";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AddBoardModal from "@/components/boards/AddBoardModal";
import BoardsList from "@/components/boards/BoardsList";
import EditBoardData from "@/components/boards/EditBoardData";
import StatusLocalModal from "@/components/projects/StatusLocalModal";
import BoardDetailsModal from "@/components/boards/BoardDetailsModal";
import { SocketContext } from "@/context/SocketContext";
import { useContext, useEffect, useState } from "react";
import StatusBoardLocalModal from "@/components/boards/StatusBoardLocalModal";
import DataVarList from "@/components/dataVars/DataVarList";

// LocalStorage key for storing unlocked projects (same as in DashboardView)
const UNLOCKED_PROJECTS_KEY = 'unlockedProjects';

function ProjectDetailsView() {
    const navigate = useNavigate()
    const params = useParams()
    // con ! le decimos a ts que ese valor siempre va a venir en el param
    const projectId = params.projectId!
    
    // State to track whether the current project is authorized
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    const { setServerAPI } = useContext(SocketContext);

    const { data, isLoading, isError } = useQuery({
        // se usa projectid en querykey para que sean unicos, no quede cacheado y no haya problemas mas adelante
        queryKey: ['project', projectId],
        //cuando tengo una funcion que toma un parametro debo tener un callback
        queryFn: () => getProjectById(projectId),
    })

    // Check if the project is authorized once data is loaded
    useEffect(() => {
        if (data) {
            // First check for debug mode - if there's a project with null serverAPIKey it's a special case
            const specialDebugMode = localStorage.getItem('debugMode') === 'true';
            if (specialDebugMode) {
                setIsAuthorized(true);
                return;
            }
            
            // Check if the project's serverAPIKey is in the unlocked projects list
            try {
                const storedProjects = localStorage.getItem(UNLOCKED_PROJECTS_KEY);
                let unlockedProjects: string[] = [];
                
                if (storedProjects) {
                    unlockedProjects = JSON.parse(storedProjects);
                }
                
                // Set authorization status based on whether the project's key is in the unlocked list
                setIsAuthorized(unlockedProjects.includes(data.serverAPIKey));
            } catch (e) {
                console.error('Error checking project authorization:', e);
                setIsAuthorized(false);
            }
        }
    }, [data]);

    // Usamos useEffect para evitar setServer dentro del render
    useEffect(() => {
        if (data && isAuthorized) {
            setServerAPI(data.serverAPIKey);
        }
    }, [data, setServerAPI, isAuthorized]); // Ejecutamos el efecto solo cuando data o isAuthorized cambien

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse text-2xl font-bold text-gray-600">Cargando proyecto...</div>
        </div>
    )
    
    if (isError) return <Navigate to='/404' />
    
    // If the project exists but user is not authorized, show access denied
    if (data && isAuthorized === false) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5 w-full max-w-lg">
                    <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
                    <p className="mb-4">
                        No tienes acceso a este proyecto. Debes desbloquearlo primero utilizando la clave API correspondiente.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (data && isAuthorized) return (
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
                            {/* <p className="text-sm text-indigo-600 font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                                <span className="font-semibold">Gateway:</span> 
                                <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded">{data.server}</span>
                            </p> */}
                            
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
                        <button
                            className="bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-lg cursor-pointer transition-all rounded-xl shadow-sm hover:shadow-md flex items-center gap-2"
                            onClick={() => navigate(`/projects/${projectId}/dashboard`)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3m0 0l3 3m-3-3v12m6-9l3-3m0 0l3 3m-3-3v12" />
                            </svg>
                            Dashboard
                        </button>
                        
                        <button
                            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-bold px-8 py-3 text-lg cursor-pointer transition-all rounded-xl shadow-sm hover:shadow-md flex items-center gap-2"
                            onClick={() => navigate('/')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver
                        </button>
                    </div>
                </div>
            </div>

            {/* Controllers Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-gray-800 mb-3 md:mb-0 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Controladores
                    </h2>
                    
                    <button
                        className="bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-8 py-3 text-lg cursor-pointer transition-all rounded-xl shadow-sm hover:shadow-md flex items-center gap-2"
                        onClick={() => navigate(location.pathname + '?newBoard=true')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo controlador
                    </button>
                </div>
                
                <div className="rounded-lg p-4">
                    <BoardsList boards={data.boards} />
                </div>
            </div>

            {/* Stored Variables Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-gray-800 mb-3 md:mb-0 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Variables almacenadas
                    </h2>
                </div>
                
                <div className="rounded-lg p-4">
                    <DataVarList dataVars={data.dataVars} />
                </div>
            </div>
            
            {/* Keep the modals */}
            <AddBoardModal />
            <EditBoardData />
            <BoardDetailsModal server={data.server} />
        </div>
    )
    
    // If we reach here, something went wrong (data loaded but isAuthorized is still null)
    return 'Verificando acceso...';
}

export default ProjectDetailsView