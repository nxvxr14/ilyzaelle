import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoardById, pollingBoards, updateActiveBoardById } from '@/api/BoardApi';
import { toast } from 'react-toastify';
import formatDateTime from '@/utils/utils.ts';
import { isAxiosError } from 'axios';

export default function TaskModalDetails() {

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
        // refetchInterval: 1000,  // Esto refetchea cada 5000 milisegundos (5 segundos),
        // refetchIntervalInBackground: true, // Esto refetchea en background
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
            // navigate(location.pathname, { replace: true })
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
            const response = await pollingBoards({ pollingData })
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
                        <div className="fixed inset-0 bg-black/60" />
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
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all p-16">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            {/* Left column content */}
                                            <p className='text-sm text-slate-400'>última actualización: {formatDateTime(data.createdAt)}</p>
                                            <Dialog.Title
                                                as="h3"
                                                className="font-black text-4xl text-slate-600 mt-5"
                                            >{data.boardName}</Dialog.Title>
                                            <div className='mt-1'>
                                                <label className='font-bold text-sm'>{data.boardType}</label>
                                            </div>
                                            <div className='mb-5'>
                                                <button className={`block py-1 text-sm leading ${data.active ? 'text-green-500' : 'text-red-500'}`} onClick={handleClick}>
                                                    {data.active ? 'en linea' : 'desconectado'}
                                                </button>

                                            </div>
                                            <div className='mt-2 mb-5 text-sm'>
                                                <p>vía: {data.boardConnect === 1 ? 'usb' : data.boardConnect === 2 ? 'wifi' : data.boardConnect === 3 ? 'ethernet' : ''}</p>
                                                <p>puerto: {data.boardInfo.port}</p>
                                                {data.boardInfo.host && <p>puerto: {data.boardInfo.host}</p>}
                                                {data.boardInfo.type && <p>type: {data.boardInfo.type}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            {/* Right column content */}
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/ArduinoUno.svg/285px-ArduinoUno.svg.png" alt="Arduino Uno" />
                                        </div>
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