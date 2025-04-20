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

    if (isLoading) return 'cargando'
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
        <>
            <div className="py-10">
                <StatusLocalModal />
                <StatusBoardLocalModal boards={data.boards}
                    server={data.server} />
                <p className="text-sm text-gray-400 italic mt-5">
                    {data.server}
                </p>
                <p className="text-sm text-gray-400 italic mt-5">
                    {data.serverAPIKey}
                </p>
                <p className='text-5xl font-black'>
                    proyecto/{data.projectName}
                </p>
                <p className='text-2xl font-light text-gray-500 mt-2'>
                    {data.description}
                </p>
                <nav className='my-5 flex gap-3'>
                    <button
                        className='bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl'
                        onClick={() => navigate(location.pathname + '/dashboard')}
                    >
                        dashboard
                    </button>
                </nav>
            </div >
            <div className="mt-5">
                <h1 className='text-5xl font-black'>
                    user/controladores
                </h1>
                <nav className='my-5 flex gap-3'>
                    <button
                        className='bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl'
                        onClick={() => navigate(location.pathname + '?newBoard=true')}
                    >
                        nuevo controlador
                    </button>
                </nav>
            </div>
            {/* no se realizo una funcion de lectura en boardApi porque cuando leimos ejecutamos la funcion de getProjectsbyid viene con la informacionde las boards anidadas porque las colecciones estan relacioandas */}
            <BoardsList
                boards={data.boards}
            />
            <AddBoardModal />
            <EditBoardData />
            <BoardDetailsModal
                server={data.server}
            />
            {/* <CodeEditorBoardData /> */}
            {/* <div className="py-20">
                <h1 className='text-5xl font-black'>
                user/snippets
                </h1>
                <nav className='my-5 flex gap-3'>
                <button
                className='bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl'
                onClick={() => navigate(location.pathname + '?newSnippet=true')}
                >
                nuevo snippet 
                </button>
                </nav>
                </div>
                <SnippetsList />
            <AddSnippetModal /> */}

            <div className="mt-20">
                <h1 className='text-5xl font-black'>
                    user/almacenamiento
                </h1>
                <nav className='my-5 flex gap-3'>
                    {/* <button
                        className='bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl'
                        onClick={() => navigate(location.pathname + '?newGlobalVar=true')}
                    >
                        nueva variable
                    </button> */}
                </nav>
                <DataVarList dataVars={data.dataVars} />
            </div>

            {/* <SnippetsList />
            <AddSnippetModal /> */}
        </>
    )
    
    // If we reach here, something went wrong (data loaded but isAuthorized is still null)
    return 'Verificando acceso...';
}

export default ProjectDetailsView