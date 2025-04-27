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
    1: 'Arduino Uno',
    2: 'Xelorium',
};

const groupNames: { [key: string]: string } = {
    1: "USB",
    2: "WiFi",
    3: "Ethernet"
};

// esto es para que el groupBoards no se genere error por typescript dado que no sabe que valores va a tenerº
type groupBoards = {
    [key: string]: Board[]
}

const initialValues: groupBoards = {
    1: [],
    2: [],
    3: []
}

function BoardsList({ boards }: BoardsListProps) {
    // este codigo sirve para agrupar un array en funcion de un valor de sus objetos, siempre y cuando esten definidos o sean true/false
    const groupedBoards = boards.reduce((acc, board) => {
        let currentGroup = acc[board.boardConnect] ? [...acc[board.boardConnect]] : [];
        currentGroup = [...currentGroup, board];
        return { ...acc, [board.boardConnect]: currentGroup };
    }, initialValues); // Cambié [] por {} El acumulador debe ser un objeto y no un arreglo vacío. Como estás agrupando los elementos por el valor 

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
                // con esto reinicio el formulario
                // reset()
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
                    {/* Usamos grid para mostrar en 3 columnas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Iteramos sobre los grupos */}
                        {Object.keys(groupedBoards).map((groupKey) => (
                            // Skip rendering empty groups
                            groupedBoards[groupKey].length > 0 && (
                                <div key={groupKey} className="space-y-4">
                                    {/* Improved section header with icon */}
                                    <div className="flex items-center mb-4">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 mr-2">
                                            {groupKey === '1' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            )}
                                            {groupKey === '2' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                                </svg>
                                            )}
                                            {groupKey === '3' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9m-9 9a9 9 0 019-9" />
                                                </svg>
                                            )}
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-700">{groupNames[groupKey]}</h2>
                                    </div>

                                    {/* Iteramos sobre los tableros de este grupo con mejor estilo */}
                                    {groupedBoards[groupKey].map((board) => (
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
                                                    
                                                    {/* Board type with icon */}
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                        </svg>
                                                        <span>{boardNames[board.boardType] || 'Desconocido'}</span>
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
                                                        {/* Back to original styling but with explicit positioning */}
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