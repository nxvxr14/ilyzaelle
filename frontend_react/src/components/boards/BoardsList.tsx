import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { Link, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Board } from "@/types/index";
import { toast } from 'react-toastify';
import { deleteBoardById } from '@/api/BoardApi';

type BoardsListProps = {
    boards: Board[]
}

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

// Modificado: objeto groupBoards ahora tiene claves numéricas para tipos de tablero
type groupBoards = {
    [key: string]: Board[]
}

// Modificado: valores iniciales ahora incluyen todos los tipos de tablero posibles
const initialValues: groupBoards = {
    '1': [],
    '2': [],
    '3': [],
    '4': [],
    '5': [],
    '6': []
}

function BoardsList({ boards }: BoardsListProps) {
    // Modificado: agrupamos por boardType en vez de boardConnect
    const groupedBoards = boards.reduce((acc, board) => {
        // Convertimos boardType a string para usarlo como clave
        const typeKey = board.boardType.toString();
        let currentGroup = acc[typeKey] ? [...acc[typeKey]] : [];
        currentGroup = [...currentGroup, board];
        return { ...acc, [typeKey]: currentGroup };
    }, initialValues);

    const params = useParams()
    const projectId = params.projectId!
    // elimia informacion cacheada para realizar otra consulta
    const queryClient = useQueryClient()

    const { mutate } = useMutation({
        mutationFn: deleteBoardById,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data),
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
        }
    })

    const handleConfigurarClick = (boardId: string) => {
        // Invalidar la query asociada al boardId
        queryClient.invalidateQueries({ queryKey: ['project', boardId] });
    }

    return (
        <>
            {boards.length ? (
                <div className="w-full">
                    {/* Change from grid to flex with column direction for board type groups */}
                    <div className="flex flex-col space-y-8">
                        {/* Iteramos sobre los grupos por tipo de tablero */}
                        {Object.keys(groupedBoards).map((typeKey) => (
                            // Skip rendering empty groups
                            groupedBoards[typeKey].length > 0 && (
                                <div key={typeKey}>
                                    {/* Cabecera de grupo con icono basado en tipo de tablero */}
                                    <div className="flex items-center mb-4">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 mr-2">
                                            {/* Iconos específicos para cada tipo de tablero */}
                                            {typeKey === '1' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            )}
                                            {typeKey === '2' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                </svg>
                                            )}
                                            {typeKey === '3' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            )}
                                            {typeKey === '4' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                                </svg>
                                            )}
                                            {typeKey === '5' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                                </svg>
                                            )}
                                            {typeKey === '6' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                </svg>
                                            )}
                                        </div>
                                        {/* Modificado: usar boardNames en vez de groupNames */}
                                        <h2 className="text-xl font-bold text-gray-700">{boardNames[parseInt(typeKey)] || "Desconocido"}</h2>
                                    </div>

                                    {/* Display boards horizontally in a grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Iteramos sobre los tableros de este grupo */}
                                        {groupedBoards[typeKey].map((board) => (
                                            <div
                                                key={board._id}
                                                className={`relative flex justify-between gap-x-6 p-5 border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow rounded-xl ${
                                                    board.active 
                                                        ? 'border-l-4 border-l-green-500' 
                                                        : 'border-l-4 border-l-red-500'
                                                }`}
                                            >
                                                {/* Status indicator dot */}
                                                <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
                                                    board.active ? 'bg-green-500' : 'bg-red-500'
                                                }`}></div>
                                                
                                                <div className="flex min-w-0 gap-x-4">
                                                    <div className="min-w-0 flex-auto space-y-2">
                                                        {/* Board name with hover effect */}
                                                        <Link
                                                            to={location.pathname + `?viewBoard=${board._id}`}
                                                            className="text-gray-800 cursor-pointer text-2xl font-bold tracking-tight block transition-all duration-200 hover:text-blue-600 relative group"
                                                        >
                                                            {board.boardName}
                                                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                                                        </Link>
                                                        
                                                        {/* Conexión con icono */}
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                                                            </svg>
                                                            <span>Conexión: {groupNames[board.boardConnect] || 'Desconocida'}</span>
                                                        </div>
                                                        
                                                        {/* Status text */}
                                                        <div className="flex items-center text-xs font-medium">
                                                            <span className={`px-2 py-1 rounded-full ${
                                                                board.active 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {board.active ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex shrink-0 items-center gap-x-6">
                                                    <Menu as="div" className="relative flex-none">
                                                        <Menu.Button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                                            <span className="sr-only">Opciones</span>
                                                            <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                                                        </Menu.Button>
                                                        <Transition
                                                            as={Fragment}
                                                            enter="transition ease-out duration-100"
                                                            enterFrom="transform opacity-0 scale-95"
                                                            enterTo="transform opacity-100 scale-100"
                                                            leave="transition ease-in duration-75"
                                                            leaveFrom="transform opacity-100 scale-100"
                                                            leaveTo="transform opacity-0 scale-95"
                                                        >
                                                            <Menu.Items className="absolute right-0 top-full mt-1 w-56 origin-top-right rounded-md bg-white py-2 shadow-xl ring-1 ring-gray-900/5 focus:outline-none z-50">
                                                                <Menu.Item>
                                                                    <Link to={location.pathname + `/boards/${board._id}/editor`} className="block px-3 py-1 text-sm leading-6 text-gray-900">
                                                                        Programar
                                                                    </Link>
                                                                </Menu.Item>
                                                                <Menu.Item>
                                                                    <Link 
                                                                        to={location.pathname + `?editBoard=${board._id}`} 
                                                                        className="block px-3 py-1 text-sm leading-6 text-gray-900"
                                                                        onClick={() => handleConfigurarClick(board._id)}
                                                                    >
                                                                        Configurar
                                                                    </Link>
                                                                </Menu.Item>
                                                                <Menu.Item>
                                                                    <button
                                                                        type="button"
                                                                        className="block px-3 py-1 text-sm leading-6 text-red-500"
                                                                        onClick={() => mutate({
                                                                            projectId,
                                                                            boardId: board._id
                                                                        })}
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                </Menu.Item>
                                                            </Menu.Items>
                                                        </Transition>
                                                    </Menu>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <p className="text-gray-500 text-xl font-medium">No hay controladores configurados</p>
                    <p className="text-gray-400 mt-2">Haga clic en 'Nuevo controlador' para comenzar</p>
                </div>
            )}
        </>
    );
}

export default BoardsList;