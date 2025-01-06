import { getProjectById } from "@/api/ProjectApi";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

const ProjectDashboardView = () => {
    const params = useParams()
    // con ! le decimos a ts que ese valor siempre va a venir en el param
    const projectId = params.projectId!

    const { data, isLoading, isError } = useQuery({
        // se usa projectid en querykey para que sean unicos, no quede cacheado y no haya problemas mas adelante
        queryKey: ['project', projectId],
        //cuando tengo una funcion que toma un parametro debo tener un callback
        queryFn: () => getProjectById(projectId)
    })

    return (
        <>
            <div className="mt-10">
                <h1 className='text-5xl font-black'>
                    dashboard/{data.projectName}
                </h1>
                {/* <p className="text-lg text-gray-400 mt-2">
                    {boardNames[data.boardType] || 'Desconocido'}
                </p> */}
                <nav className='mt-5 flex gap-3'>
                    <Link className='bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl'
                        to={`/projects/${projectId}`}
                    >
                        volver
                    </Link>
                </nav>
            </div>
        </>
    );
};

export default ProjectDashboardView;
