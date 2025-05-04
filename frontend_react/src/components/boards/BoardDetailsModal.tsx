import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoardById, pollingBoards, updateActiveBoardById } from '@/api/BoardApi';
import { toast } from 'react-toastify';
import formatDateTime from '@/utils/utils.ts';
import { isAxiosError } from 'axios';

const boardNames: { [key: number]: string } = {
    1: 'Arduino',
    2: 'Xelorium',
    3: 'Esp32',
    4: 'HTTP',
    5: 'MQTT',
    6: "Factory IO"
};

const groupNames: { [key: string]: string } = {
    1: "USB",
    2: "WiFi",
    3: "Ethernet",
    4: "Nodo"
};

export default function BoardDetailsModal({ server }: { server: string }) {

    const params = useParams()
    const projectId = params.projectId!

    const location = useLocation();
    const query = new URLSearchParams(location.search);
    // con ! nos aseguramos que boardId siempre va a existir
    const boardId = query.get('viewBoard')!
    // con esto se cierra el modal
    const show = boardId ? true : false;

    // elimia informacion cacheada para realizar otra consulta
    const queryClient = useQueryClient()

    const navigate = useNavigate()

    //esto sirve para hacer consultas en ciertos componentes usando useQuerys y no se enviadatos por props
    const { data, isError, error } = useQuery({
        queryKey: ['board', boardId],
        queryFn: () => getBoardById({ projectId, boardId }),
        // con esto nos aseguramos que solo se realice la consulta si existe el boardId
        enabled: show,
        retry: false,
    })

    const { mutate } = useMutation({
        mutationFn: updateActiveBoardById,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({ queryKey: ['board', boardId] })
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
        }
    })

    const handleClick = async () => {
        // se usa if porque data puede ser null, el usuario le podria dar click al boton antes que la api de los valores de data y podria mandar undefined
        if (data) {
            const updatedData = {
                projectId,
                boardId,
                active: !data.active
            };

            const pollingData = {
                _id: data._id,
                boardType: data.boardType,
                boardName: data.boardName,
                boardConnect: data.boardConnect,
                boardInfo: data.boardInfo,
                active: !data.active,
                project: data.project,
                boardCode: data.boardCode,
                closing: data.active
            }
            // pollingboards sirve para verificar si hay conexion con el backend local antes de hacer una escritura a la base de datos
            const response = await pollingBoards({ pollingData }, server)
            if (isAxiosError(response)) {
                return toast.error("localhost sin conexion");
            }
            mutate(updatedData);
        }
    }

    if (isError) {
        toast.error(error.message, { toastId: 'error' })
        // componente navigate lleva de forma programada un usuario a otra url
        // no se puede usar navigate en este caso porque interfiere con react en la renderizacion y linkto funciona de forma distinta
        return <Navigate to={`/projects/${projectId}`} replace />
    }

    if (data) return (
        <>
            <Transition appear show={show} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => navigate(location.pathname, { replace: true })}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all p-6 md:p-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-5">
                                            {/* Left column content */}
                                            <div className="border-l-4 border-yellow-400 pl-4">
                                                <p className='text-sm text-gray-400'>Última actualización: {formatDateTime(data.updatedAt)}</p>
                                                <Dialog.Title
                                                    as="h3"
                                                    className="font-black text-4xl text-gray-800 mt-2"
                                                >{data.boardName}</Dialog.Title>
                                            </div>
                                            
                                            {/* Type badge */}
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                    </svg>
                                                    {boardNames[data.boardType] || 'Desconocido'}
                                                </span>
                                            </div>
                                            
                                            {/* Active status - Updated to match new style but kept as a button */}
                                            <div>
                                                <button 
                                                    className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                                                        data.active 
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                    onClick={handleClick}
                                                >
                                                    <div className="flex items-center">
                                                        <div className={`w-3 h-3 rounded-full mr-2 ${
                                                            data.active ? 'bg-green-500' : 'bg-red-500'
                                                        }`}></div>
                                                        {data.active ? 'Conectado' : 'Desconectado'}
                                                    </div>
                                                </button>
                                            </div>
                                            
                                            {/* Connection details */}
                                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
                                                <h4 className="text-lg font-bold text-gray-700 border-b border-gray-200 pb-2 mb-2">Detalles de Conexión</h4>
                                                
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                                                    </svg>
                                                    <span className="font-medium">Conexión:</span> 
                                                    <span className="ml-2">{groupNames[data.boardConnect] || 'Desconocida'}</span>
                                                </div>
                                                
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="font-medium">Puerto:</span> 
                                                    <span className="ml-2 font-mono">{data.boardInfo.port}</span>
                                                </div>
                                                
                                                {data.boardInfo.host && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                        </svg>
                                                        <span className="font-medium">Host:</span> 
                                                        <span className="ml-2 font-mono">{data.boardInfo.host}</span>
                                                    </div>
                                                )}
                                                
                                                {data.boardInfo.type && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                        </svg>
                                                        <span className="font-medium">Tipo:</span> 
                                                        <span className="ml-2">{data.boardInfo.type}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-center">
                                            {/* Right column - Device image based on type */}
                                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 w-full h-full flex flex-col items-center justify-center">
                                                <img
                                                    src={data.boardType === 1
                                                        ? "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/ArduinoUno.svg/285px-ArduinoUno.svg.png"
                                                        : data.boardType === 2 
                                                        ? "https://i.ibb.co/BVf8kh7/image.png"
                                                        : data.boardType === 3
                                                        ? "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg/320px-ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg"
                                                        : data.boardType === 4
                                                        ? "https://cdn-icons-png.flaticon.com/512/1998/1998342.png"
                                                        : data.boardType === 5
                                                        ? "https://cdn-icons-png.flaticon.com/512/6119/6119533.png"
                                                        : "https://cdn-icons-png.flaticon.com/512/4616/4616314.png"
                                                    }
                                                    alt={boardNames[data.boardType] || "Dispositivo"}
                                                    className="max-w-full h-auto max-h-64 object-contain mb-4"
                                                />
                                                {/* <p className="text-center text-sm text-gray-500 font-medium">
                                                    ID: <span className="font-mono">{data._id.substring(0, 10)}...</span>
                                                </p> */}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Footer with close button */}
                                    <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                                        <button
                                            onClick={() => navigate(location.pathname, { replace: true })}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium transition-colors"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}