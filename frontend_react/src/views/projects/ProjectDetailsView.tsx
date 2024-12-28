import { getProjectById } from "@/api/ProjectApi";
import EditProjectForm from "@/components/projects/EditProjectForm";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AddBoardModal from "@/components/boards/AddBoardModal";

function ProjectDetailsView() {
    const navigate = useNavigate()

    const params = useParams()
    // con ! le decimos a ts que ese valor siempre va a venir en el param
    const projectId = params.projectId!

    const { data, isLoading, isError } = useQuery({
        // se usa projectid en querykey para que sean unicos, no quede cacheado y no haya problemas mas adelante
        queryKey: ['editProject', projectId],
        //cuando tengo una funcion que toma un parametro debo tener un callback
        queryFn: () => getProjectById(projectId)
    })

    if (isLoading) return 'cargando'
    if (isError) return <Navigate to='/404' />

    if (data) return (
        <>
            <h1 className='text-5xl font-black'>
                {data.projectName}
            </h1>

            <p className='text-2xl font-light text-gray-500 mt-5'>
                {data.description}
            </p>

            <nav className='my-5 flex gap-3'>
                <button
                    className='bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors'
                    onClick={() => navigate('?newBoard=true')}
                >
                    agregar board
                </button>

            </nav>

            <AddBoardModal />
        </>
    )
}

export default ProjectDetailsView 