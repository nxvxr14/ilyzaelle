import { Link } from "react-router-dom";
import { useForm } from 'react-hook-form';
import ProjectForm from "@/components/ProjectForm";
import { ProjectFormData } from "types";
import { createProject } from "@/api/ProjectApi";

function CreateProjectView() {

    const initialValues : ProjectFormData = {
        projectName: "",
        description: ""
    }

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialValues
    })

    const handleForm = (data : ProjectFormData) => {
        createProject(data);

    }

    return (
        <>
            <h1 className='text-5xl font-black'>crear proyecto</h1>
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
                        value='crear proyecto'
                        className='bg-black hover:bg-[#FFFF44] text-white hover:text-black w-full p-3  font-bold cursor-pointer transition-color'
                    />
                </form>
            </div>
        </>
    );
}

export default CreateProjectView