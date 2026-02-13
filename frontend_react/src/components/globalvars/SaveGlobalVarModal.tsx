import { Fragment, useContext, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SaveGlobalVarForm from './SaveGlobalVarForm';
import { SaveGlobalVarFormData } from "@/types/index";
import { createDataVar } from '@/api/DataVarApi';
import { SocketContext } from "@/context/SocketContext";

type SaveGlobalModalProps = {
    nameGlobalVar: string
    gVar: any,
}

export default function SaveGlobalVarModal({ nameGlobalVar, gVar }: SaveGlobalModalProps) {
    // para quitar el parametro de la url 
    const navigate = useNavigate()
    const { socket, serverAPI } = useContext(SocketContext);
    const [saveError, setSaveError] = useState<string | null>(null);

    // con todo este codigo puedo leer los datos que se envian por medio de la url
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const modalGlobalVar = queryParams.get('saveGlobalVar')
    const show = modalGlobalVar ? true : false

    //para obtener el projectid del url por si lo necesito
    const params = useParams()
    const projectId = params.projectId!

    // elimia informacion cacheada para realizar otra consulta
    const queryClient = useQueryClient()

    //boardForm exige que le pasemos datos, asi que le enviamos los valores iniciales por medio de useForm
    const initialValues: SaveGlobalVarFormData = {
        nameData: '',
        description: '',
    };

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: initialValues
    });

    // despues de crear snippetapi vengo aca y uso usemutation
    const { mutate } = useMutation({
        // aca va la funcion de la api
        mutationFn: createDataVar,
        onError: (error: any) => {
            setSaveError(error.message || "Error al guardar la variable");
            toast.error(error.message || "Error al guardar la variable");
        },
        onSuccess: (data) => {
            setSaveError(null);
            toast.success(data);
            // revisar esto bien
            queryClient.invalidateQueries({ queryKey: ['project'] })
            reset();
            navigate(location.pathname, { replace: true })
        }
    });

    // New mutation for saving the time vector
    const { mutate: mutateTimeVector } = useMutation({
        mutationFn: createDataVar,
        onError: (error) => {
            toast.error(`Time vector error: ${error.message}`)
        },
        onSuccess: (data) => {
            toast.info(`Time vector saved: ${data}`)
            queryClient.invalidateQueries({ queryKey: ['project'] })
        }
    });

    const handleSaveGlobalVar = (formData: SaveGlobalVarFormData) => {
        setSaveError(null);
        // Save the original variable
        const finalFormData = {
            ...formData,
            nameGlobalVar,
            gVar
        }
        const data = {
            finalFormData,
            projectId
        }
        mutate(data);

        // Check if this is an array and has a corresponding time vector
        if (Array.isArray(gVar)) {
            // Get the corresponding time vector name
            const timeVectorName = `${nameGlobalVar}_time`;
            
            // El polling de ProjectDashboardView ya solicita gVar cada 500ms,
            // así que solo escuchamos la próxima respuesta para obtener el _time vector
            if (socket) {
                const handleGVarData = (gVarData: any, responseServerAPIKey: string, responseProjectId: string) => {
                    // Filtrar para aceptar solo datos de nuestro proyecto
                    if (responseServerAPIKey !== serverAPI || responseProjectId !== projectId) return;

                    // Check if the time vector exists
                    if (gVarData && gVarData[timeVectorName]) {
                        // Create a new data variable for the time vector
                        const timeVectorFormData = {
                            nameData: `${formData.nameData}_time`, // Append _time to the name
                            description: `Time vector for ${formData.nameData}`,
                            nameGlobalVar: timeVectorName,
                            gVar: gVarData[timeVectorName]
                        };
                        
                        const timeData = {
                            finalFormData: timeVectorFormData,
                            projectId
                        };
                        
                        // Save the time vector
                        mutateTimeVector(timeData);
                        
                        // Remove the listener
                        socket.off('response-gVar-update-b-f', handleGVarData);
                    }
                };
                
                socket.on('response-gVar-update-b-f', handleGVarData);
                
                // Set a timeout to remove the listener if no response
                setTimeout(() => {
                    socket.off('response-gVar-update-b-f', handleGVarData);
                }, 5000);
            }
        }
    }

    return (
        <>
            <Transition appear show={show} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => navigate(location.pathname, { replace: true })}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all p-8 md:p-12 border border-gray-100">
                                    <div className="border-l-8 border-yellow-400 pl-5 mb-8">
                                        <Dialog.Title
                                            as="h3"
                                            className="font-black text-3xl md:text-4xl text-gray-900 mb-2"
                                        >
                                            Guardar Variable
                                        </Dialog.Title>
                                        <p className="text-lg text-gray-600">
                                            Completa la información para guardar esta variable
                                            {Array.isArray(gVar) && (
                                                <span className="text-green-600 block mt-1">
                                                    (Se guardará automáticamente el vector de tiempo asociado)
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {saveError && (
                                        <div className="mt-3 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md mb-6">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm">{saveError}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <form
                                        className='mt-8 space-y-5'
                                        onSubmit={handleSubmit(handleSaveGlobalVar)}
                                        noValidate
                                    >
                                        <SaveGlobalVarForm
                                            nameGlobalVar={nameGlobalVar}
                                            register={register}
                                            errors={errors}
                                        />
                                        <div className="pt-4">
                                            <input
                                                type="submit"
                                                value='Guardar Variable'
                                                className='bg-black hover:bg-yellow-400 text-white hover:text-black w-full p-4 font-bold cursor-pointer transition-all duration-300 rounded-xl shadow-md hover:shadow-lg text-lg uppercase tracking-wide'
                                            />
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}
