import { getProjectById } from "@/api/ProjectApi";
import EditProjectForm from "@/components/projects/EditProjectForm";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";

function EditProjectView() {
    const params = useParams()
    // con ! le decimos a ts que ese valor siempre va a venir en el param
    const projectId = params.projectId!

    const { data, isLoading, isError } = useQuery({
        // se usa projectid en querykey para que sean unicos, no quede cacheado y no haya problemas mas adelante
        queryKey: ['editProject', projectId],
        //cuando tengo una funcion que toma un parametro debo tener un callback
        queryFn: () => getProjectById(projectId) 
    })

    if(isLoading) return 'cargando'
    if(isError) return <Navigate to='/404' />
    
    if(data) return <EditProjectForm  data={data} projectId={projectId}/>
}

export default EditProjectView; 