import { Link, useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from "react-toastify";
import ProjectForm from "@/components/projects/ProjectForm";
import { ProjectFormData } from "types";
import { createProject } from "@/api/ProjectApi";

// LocalStorage key for storing unlocked projects
const UNLOCKED_PROJECTS_KEY = 'unlockedProjects';

export default function CreateProjectView() {
    const navigate = useNavigate();

    const initialValues: ProjectFormData = {
        projectName: "",
        description: "",
        server: "",
        serverAPIKey: ""
    };

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialValues
    });

    const { mutate } = useMutation({
        mutationFn: createProject,
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (data, variables) => {
            toast.success(data);
            
            // Save the serverAPIKey to localStorage so this project is automatically unlocked
            if (variables.serverAPIKey) {
                try {
                    // Get existing unlocked projects
                    const storedProjects = localStorage.getItem(UNLOCKED_PROJECTS_KEY);
                    let unlockedProjects: string[] = [];
                    
                    if (storedProjects) {
                        unlockedProjects = JSON.parse(storedProjects);
                    }
                    
                    // Add the new project's serverAPIKey if it's not already there
                    if (!unlockedProjects.includes(variables.serverAPIKey)) {
                        unlockedProjects.push(variables.serverAPIKey);
                        localStorage.setItem(UNLOCKED_PROJECTS_KEY, JSON.stringify(unlockedProjects));
                    }
                } catch (e) {
                    console.error('Error saving project to localStorage:', e);
                }
            }
            
            navigate('/');
        }
    });

    const handleForm = (formData: ProjectFormData) => mutate(formData);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6">
                    <div className="border-l-4 border-yellow-400 pl-4 mb-6">
                        <h1 className="text-4xl font-black text-gray-800">Crear Proyecto</h1>
                        <p className="text-lg text-gray-500 mt-2">Completa el formulario para crear un nuevo proyecto</p>
                    </div>
                    
                    <Link 
                        to="/"
                        className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl transition-colors shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </Link>
                </div>
            </div>
            
            {/* Form section */}
            <div className="max-w-3xl mx-auto">
                <form 
                    className="bg-white rounded-xl shadow-md overflow-hidden p-8"
                    onSubmit={handleSubmit(handleForm)}
                    noValidate
                >
                    <ProjectForm
                        register={register}
                        errors={errors}
                    />
                    
                    <div className="mt-8">
                        <button
                            type="submit"
                            className="w-full bg-black hover:bg-yellow-400 text-white hover:text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg uppercase tracking-wide shadow-md hover:shadow-lg"
                        >
                            Crear Proyecto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}