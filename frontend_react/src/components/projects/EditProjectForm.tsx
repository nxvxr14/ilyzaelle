import { Link, useNavigate } from "react-router-dom";
import { ProjectFormData } from "@/types/index";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProjectById } from "@/api/ProjectApi";
import { toast } from "react-toastify";
import ProjectForm from "./ProjectForm";

// useQuerryClienta sirve para escribir o ejecutar, reiniciar o invalidar datos previos para tener actualizado los datos del frontend

type EditProjectFormProps = {
    data: ProjectFormData,
    projectId: string
}

function EditProjectForm({ data, projectId }: EditProjectFormProps) {

    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            projectName: data.projectName,
            description: data.description,
            host: data.host,
            serverAPIKey: data.serverAPIKey
        }
    })

    // elimia informacion cacheada para realizar otra consulta
    const queryClient = useQueryClient()

    const { mutate } = useMutation({
        mutationFn: updateProjectById,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            // despues de que actualiza un proyecto vuelve a consultar la base de datos para actualizar el frontend
            // como el key del componente de proyectos es projects'', esa vista es la que queremos recargar
            // puedo hacer multiples
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            queryClient.invalidateQueries({ queryKey: ['editProject', projectId] })
            toast.success(data)
            navigate('/')
        }
    })

    const handleForm = (formData: ProjectFormData) => {
        const data = {
            formData,
            projectId
        }
        mutate(data)
    }

    return (
        <>
            <h1 className='text-5xl font-black'>proyectos/editar</h1>
            <p className='text-1xl font-light text-gray-500 mt-5'>completa el formulario</p>

            <nav className="my-5">
                <Link className='bg-black hover:bg-[#FFFF44] text-white hover:text-black px-10 py-3 text-xl font-bold cursor-pointer transition-colors rounded-md'
                    to='/'
                >
                    volver
                </Link>
            </nav>

            {/* <form className='mt-10 bg-white p-10 rounded-lg border border-gray-300'> */}
            <div className='max-w-3xl mx-auto'>
                <form className='mt-10 pt-10 bg-white p-5 shadow-md shadow-purple-200/50 rounded-md'
                    onSubmit={handleSubmit(handleForm)}
                    noValidate
                >
                    <ProjectForm
                        register={register}
                        errors={errors}
                    />
                    <input
                        type="submit"
                        value='editar'
                        className='bg-black hover:bg-[#FFFF44] text-white hover:text-black w-full p-3  font-bold cursor-pointer transition-color'
                    />
                </form>
            </div>
        </>
    );
}

export default EditProjectForm;