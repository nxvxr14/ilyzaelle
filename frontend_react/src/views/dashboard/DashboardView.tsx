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
        
        // Check if debug mode was enabled
        if (localStorage.getItem('debugMode') === 'true') {
            setDebugMode(true);
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
        <div className="container mx-auto px-4 py-8">
            {/* Header section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6">
                    <div className="border-l-4 border-yellow-400 pl-4 mb-6">
                        <h1 className="text-4xl font-black text-gray-800">Proyectos</h1>
                        <p className="text-lg text-gray-500 mt-2">Administra tus proyectos</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <Link 
                            className="bg-black hover:bg-yellow-400 text-white hover:text-black px-8 py-3 rounded-xl text-lg font-bold cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center"
                            to='/projects/create'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo proyecto
                        </Link>
                        
                        <form onSubmit={handleServerApiKeySubmit} className="flex-grow flex max-w-md">
                            <input
                                type="text"
                                value={serverApiKeyInput}
                                onChange={(e) => setServerApiKeyInput(e.target.value)}
                                placeholder="Ingresar clave API para desbloquear proyecto"
                                className="w-full border border-gray-300 px-4 py-3 rounded-l-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button 
                                type="submit"
                                className="bg-black hover:bg-yellow-400 text-white hover:text-black px-4 py-3 text-sm font-bold cursor-pointer transition-all duration-300 rounded-r-xl"
                            >
                                Desbloquear
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            {/* Debug mode banner */}
            {debugMode && (
                <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 mb-8 rounded-lg shadow-md flex justify-between items-center">
                    <div>
                        <p className="font-bold">Modo Depuración Activo</p>
                        <p className="text-sm">Mostrando todos los proyectos disponibles</p>
                    </div>
                    <button 
                        onClick={exitDebugMode}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Salir
                    </button>
                </div>
            )}
            
            {/* Projects list */}
            {visibleProjects.length ? (
                <div className="bg-white rounded-xl shadow-md overflow-visible border border-gray-100"> {/* Changed overflow-hidden to overflow-visible */}
                    <div className="border-t-4 border-yellow-400 pt-4"></div>
                    <ul role="list" className="divide-y divide-gray-100">
                        {visibleProjects.map((project) => (
                            <li key={project._id} className="flex justify-between gap-x-6 p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex min-w-0 gap-x-4">
                                    <div className="min-w-0 flex-auto space-y-4">
                                        <Link to={`/projects/${project._id}`} 
                                            className="text-gray-800 cursor-pointer text-3xl font-bold tracking-tight block transition-all duration-200 hover:text-blue-600 relative group"
                                        >
                                            {project.projectName}
                                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                                        </Link>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-2">
                                            {/* <p className="text-sm text-indigo-600 font-medium flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                                <span className="font-semibold">Gateway:</span> <span className="ml-1 font-mono">{project.server}</span>
                                            </p> */}
                                            
                                            <p className="text-sm text-emerald-600 font-medium flex items-center mt-1 sm:mt-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                </svg>
                                                <span className="font-semibold">Gateway API key:</span> <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded">{project.serverAPIKey}</span>
                                            </p>
                                        </div>
                                        
                                        <p className="text-gray-600 leading-relaxed border-l-4 border-gray-200 pl-3 italic">
                                            {project.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-x-4">
                                    <Menu as="div" className="relative flex-none">
                                        <Menu.Button className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                            <span className="sr-only">Opciones</span>
                                            <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                                        </Menu.Button>
                                        <Transition as={Fragment} 
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95" 
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75" 
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95">
                                            <Menu.Items
                                                className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-lg bg-white py-2 shadow-xl ring-1 ring-gray-900/5 focus:outline-none"
                                                style={{ 
                                                    // Use dynamic positioning to prevent cut-off at bottom
                                                    maxHeight: '300px',
                                                    overflowY: 'auto',
                                                }}
                                            >
                                                <Menu.Item>
                                                    <Link to={`/projects/${project._id}`}
                                                        className='block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700'>
                                                        Abrir
                                                    </Link>
                                                </Menu.Item>
                                                <Menu.Item>
                                                    <Link to={`/projects/${project._id}/edit`}
                                                        className='block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700'>
                                                        Editar
                                                    </Link>
                                                </Menu.Item>
                                                <Menu.Item>
                                                    <Link to={`/projects/${project._id}/dashboard`}
                                                        className='block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700'>
                                                        Dashboard
                                                    </Link>
                                                </Menu.Item>
                                                <Menu.Item>
                                                    <button
                                                        type='button'
                                                        className='block px-4 py-2 text-sm hover:bg-red-50 text-red-600 w-full text-left'
                                                        onClick={() => mutate(project._id)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </Menu.Item>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-10 text-center mt-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-2xl font-bold text-gray-700 mb-2">No hay proyectos disponibles</p>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Crea un nuevo proyecto o ingresa una clave API para ver los proyectos existentes.
                    </p>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-2xl font-bold text-gray-600">Cargando proyectos...</div>
            </div>
        </div>
    );
}
