import { getProjectById } from "@/api/ProjectApi";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AddBoardModal from "@/components/boards/AddBoardModal";
import BoardsList from "@/components/boards/BoardsList";
import EditBoardData from "@/components/boards/EditBoardData";
import StatusLocalModal from "@/components/projects/StatusLocalModal";
import BoardDetailsModal from "@/components/boards/BoardDetailsModal";
import { SocketContext } from "@/context/SocketContext";
import { useContext, useEffect } from "react";
import StatusBoardLocalModal from "@/components/boards/StatusBoardLocalModal";
import AddGlobalVarModal from "@/components/globalvars/AddGlobalVarModal";
import GlobalVarList from "@/components/globalvars/GlobalVarList";

// import AddSnippetModal from "@/components/snippets/AddSnippetModal";
// import SnippetsList from "@/components/snippets/SnippetsList";

function ProjectDetailsView() {

    const { online } = useContext(SocketContext)

    const navigate = useNavigate()
    const params = useParams()
    // con ! le decimos a ts que ese valor siempre va a venir en el param
    const projectId = params.projectId!

    const { setServer } = useContext(SocketContext);

    const { data, isLoading, isError } = useQuery({
        // se usa projectid en querykey para que sean unicos, no quede cacheado y no haya problemas mas adelante
        queryKey: ['project', projectId],
        //cuando tengo una funcion que toma un parametro debo tener un callback
        queryFn: () => getProjectById(projectId),
    })

    // Usamos useEffect para evitar setServer dentro del render
    useEffect(() => {
        if (data) {
            setServer(data.server);
        }
    }, [data, setServer]); // Ejecutamos el efecto solo cuando data cambie

    if (isLoading) return 'cargando'
    if (isError) return <Navigate to='/404' />

    if (data) return (
        <>
            <div className="py-10">
                <StatusLocalModal />
                <StatusBoardLocalModal boards={data.boards}
                    server={data.server} />
                <p className="text-sm text-gray-400 italic mt-5">
                    {data.server}
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

            {online && (
                <div className="mt-20">
                    <h1 className='text-5xl font-black'>
                        user/globalVars
                    </h1>
                    <nav className='my-5 flex gap-3'>
                        <button
                            className='bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl'
                            onClick={() => navigate(location.pathname + '?newGlobalVar=true')}
                        >
                            nueva variable
                        </button>
                    </nav>
                </div>
            )}
            <AddGlobalVarModal />
            <GlobalVarList projectId={projectId} />

            {/* <SnippetsList />
            <AddSnippetModal /> */}
        </>
    )
}

export default ProjectDetailsView 