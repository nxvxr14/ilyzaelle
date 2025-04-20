import { Fragment, useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProjectById, getProjects } from "@/api/ProjectApi";
import { toast } from 'react-toastify';

// LocalStorage key for storing unlocked projects
const UNLOCKED_PROJECTS_KEY = 'unlockedProjects';

export default function DashboardView() {
    // State for the server API key input
    const [serverApiKeyInput, setServerApiKeyInput] = useState<string>('');
    
    // State to track which project serverAPIKeys have been unlocked
    const [unlockedProjects, setUnlockedProjects] = useState<string[]>([]);
    
    // Special state for debug mode (show all projects)
    const [debugMode, setDebugMode] = useState(false);

    const { data } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects
    })

    const queryClient = useQueryClient()

    // Load unlocked projects from localStorage on component mount
    useEffect(() => {
        const storedProjects = localStorage.getItem(UNLOCKED_PROJECTS_KEY);
        if (storedProjects) {
            try {
                const parsedProjects = JSON.parse(storedProjects);
                if (Array.isArray(parsedProjects)) {
                    setUnlockedProjects(parsedProjects);
                }
            } catch (e) {
                console.error('Error parsing stored projects:', e);
            }
        }
    }, []);

    // Save unlocked projects to localStorage whenever the list changes
    useEffect(() => {
        if (unlockedProjects.length > 0) {
            localStorage.setItem(UNLOCKED_PROJECTS_KEY, JSON.stringify(unlockedProjects));
        }
    }, [unlockedProjects]);

    const { mutate } = useMutation({
        mutationFn: deleteProjectById,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            // despues de que actualiza un proyecto vuelve a consultar la base de datos para actualizar el frontend
            // como el key del componente de proyectos es projects'', esa vista es la que queremos recargar
            // puedo hacer multiples
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            toast.success(data)
        }
    })
    
    // Handle serverAPIKey input submission
    const handleServerApiKeySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Special case: "null" for debug mode
        if (serverApiKeyInput.trim().toLowerCase() === "null") {
            setDebugMode(true);
            localStorage.setItem('debugMode', 'true'); // Store debug mode in localStorage
            toast.info('Modo depuración activado - Mostrando todos los proyectos');
            setServerApiKeyInput('');
            return;
        }
        
        if (!serverApiKeyInput.trim()) {
            toast.error('Por favor ingresa una clave API válida');
            return;
        }
        
        // Check if any project matches this serverAPIKey
        const matchingProject = data?.find(project => project.serverAPIKey === serverApiKeyInput);
        
        if (matchingProject) {
            // Add the serverAPIKey to unlocked projects if not already there
            if (!unlockedProjects.includes(serverApiKeyInput)) {
                setUnlockedProjects(prev => [...prev, serverApiKeyInput]);
                toast.success('Proyecto desbloqueado correctamente');
                setServerApiKeyInput(''); // Clear input field after successful unlock
            } else {
                toast.info('Este proyecto ya está desbloqueado');
            }
        } else {
            toast.error('No se encontró ningún proyecto con esa clave API');
        }
    };
    
    // Exit debug mode function
    const exitDebugMode = () => {
        setDebugMode(false);
        localStorage.removeItem('debugMode'); // Remove debug mode from localStorage
        toast.info('Modo depuración desactivado');
    };
    
    // Filter projects based on unlocked projects or debug mode
    const visibleProjects = data ? 
        (debugMode ? data : data.filter(project => unlockedProjects.includes(project.serverAPIKey))) 
        : [];

    if (data) return (
        <>
            <h1 className='text-5xl font-black'>proyectos/</h1>
            <p className='text-1xl font-light text-gray-500 mt-5'>maneja y administra tus proyectos</p>

            <div className="my-5 flex flex-col md:flex-row md:items-center gap-4">
                <Link className='bg-black hover:bg-[#FFFF44] text-white hover:text-black px-10 py-3 text-xl font-bold cursor-pointer transition-colors rounded-2xl'
                    to='/projects/create'
                >
                    nuevo proyecto
                </Link>
                
                <form onSubmit={handleServerApiKeySubmit} className="flex-grow flex max-w-md">
                    <input
                        type="text"
                        value={serverApiKeyInput}
                        onChange={(e) => setServerApiKeyInput(e.target.value)}
                        placeholder="Ingresar clave API para desbloquear proyecto"
                        className="w-full border border-gray-300 px-4 py-3 rounded-l-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFF44] focus:border-transparent"
                    />
                    <button 
                        type="submit"
                        className="bg-black hover:bg-[#FFFF44] text-white hover:text-black px-4 py-3 text-sm font-bold cursor-pointer transition-colors rounded-r-2xl"
                    >
                        Desbloquear
                    </button>
                </form>
            </div>
            
            {/* Debug mode banner */}
            {debugMode && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-5 flex justify-between items-center">
                    <div>
                        <p className="font-bold">Modo Depuración Activo</p>
                        <p className="text-sm">Mostrando todos los proyectos (no persistente)</p>
                    </div>
                    <button 
                        onClick={exitDebugMode}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Salir del modo depuración
                    </button>
                </div>
            )}
            
            {visibleProjects.length ? (
                <ul role="list" className="divide-y divide-gray-100 border border-gray-100 mt-10 bg-white shadow-lg rounded-2xl" style={{ borderTopColor: '#FFFF44', borderTopWidth: '8px' }}>
                    {visibleProjects.map((project) => (
                        <li key={project._id} className="flex justify-between gap-x-6 px-5 py-10">
                            <div className="flex min-w-0 gap-x-4">
                                <div className="min-w-0 flex-auto space-y-2">
                                    <Link to={`/projects/${project._id}`} className="text-gray-600 cursor-pointer hover:underline text-3xl font-bold"
                                    >{project.projectName}</Link>
                                    <p className="text-sm text-gray-400 italic">
                                        {project.server}
                                    </p>
                                    <div
                                        className={`inline-block px-4 py-2 rounded-lg text-center text-white text-sm 
                                        ${project.status ? 'bg-green-500' : 'bg-red-500'}`}
                                    >
                                        {project.status ? 'en linea' : 'desconectado'}
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {project.description}
                                    </p>
                                    {/* Display serverAPIKey in debug mode */}
                                    {debugMode && (
                                        <p className="text-xs text-gray-500 mt-2 font-mono bg-gray-100 p-1 inline-block">
                                            API Key: {project.serverAPIKey}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-x-6">
                                <Menu as="div" className="relative flex-none">
                                    <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                                        <span className="sr-only">opciones</span>
                                        <EllipsisVerticalIcon className="h-9 w-9" aria-hidden="true" />
                                    </Menu.Button>
                                    <Transition as={Fragment} enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95">
                                        <Menu.Items
                                            className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
                                        >
                                            <Menu.Item>
                                                <Link to={`/projects/${project._id}`}
                                                    className='block px-3 py-1 text-sm leading-6 text-gray-900'>
                                                    abrir
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item>
                                                {/* con esto obtenemos el valor de la id */}
                                                {/* se lee de la url  */}
                                                <Link to={`/projects/${project._id}/edit`}
                                                    className='block px-3 py-1 text-sm leading-6 text-gray-900'>
                                                    editar
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item>
                                                <button
                                                    type='button'
                                                    className='block px-3 py-1 text-sm leading-6 text-red-500'
                                                    onClick={() => mutate(project._id)}
                                                >
                                                    eliminar
                                                </button>
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="mt-20 text-center">
                    <p className="text-3xl mb-4">:(</p>
                    <p className="text-gray-500">
                        No tienes proyectos desbloqueados. Crea un nuevo proyecto o ingresa una clave API para ver los proyectos existentes.
                    </p>
                </div>
            )}
        </>
    );
}
