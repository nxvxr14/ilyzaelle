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
    2: 'PLC328P',
};

const groupNames: { [key: string]: string } = {
    1: "usb",
    2: "wifi",
    3: "ethernet"
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
                <div className="">
                    {/* Usamos grid para mostrar en 3 columnas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Iteramos sobre los grupos */}
                        {Object.keys(groupedBoards).map((groupKey) => (
                            <div key={groupKey} className="space-y-4">
                                <h2 className="text-2xl font-semibold text-gray-700 mb-4"> /{`${groupNames[groupKey] || groupKey}`}</h2>

                                {/* Iteramos sobre los tableros de este grupo */}
                                {groupedBoards[groupKey].map((board) => (
                                    <div
                                        key={board._id}
                                        className="flex justify-between gap-x-6 p-5 border border-gray-100 bg-white shadow-lg rounded-2xl"
                                        style={{ borderTopColor: '#FFFF44', borderTopWidth: '8px' }} // Estableciendo color y grosor del borde superior
                                    >
                                        <div className="flex min-w-0 gap-x-4">
                                            <div className="min-w-0 flex-auto space-y-2">
                                                {/* Mostramos boardName y boardType */}
                                                <Link
                                                    to={location.pathname + `?viewBoard=${board._id}`}
                                                    className="text-gray-600 cursor-pointer hover:underline text-3xl font-bold"
                                                >
                                                    {board.boardName}
                                                </Link>
                                                <p className="text-sm text-gray-400">
                                                    {boardNames[board.boardType] || 'Desconocido'}
                                                </p>
                                                {/* Estado del proyecto */}
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className={`w-4 h-4 rounded-full ${board.active ? 'bg-green-500' : 'bg-red-500'}`}
                                                    />
                                                </div>
                                                {/* <span className="text-lg font-bold">
                                                        {board.active ? 'activo' : 'inactivo'}
                                                    </span> */}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-x-6">
                                            <Menu as="div" className="relative flex-none">
                                                <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                                                    <span className="sr-only">Opciones</span>
                                                    <EllipsisVerticalIcon className="h-9 w-9" aria-hidden="true" />
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
                                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                                                        <Menu.Item>
                                                            <Link to={location.pathname + `/boards/${board._id}/editor`} className="block px-3 py-1 text-sm leading-6 text-gray-900">
                                                                programar
                                                            </Link>
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            <Link to={location.pathname + `?editBoard=${board._id}`} className="block px-3 py-1 text-sm leading-6 text-gray-900"
                                                                onClick={() => handleConfigurarClick(board._id)}  // Llamada a la función de invalidación
                                                            >
                                                                configurar
                                                            </Link>
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            <button
                                                                type="button"
                                                                className="block px-3 py-1 text-sm leading-6 text-red-500"
                                                                onClick={() => mutate({
                                                                    projectId
                                                                    , boardId: board._id
                                                                })}
                                                            >
                                                                eliminar
                                                            </button>
                                                        </Menu.Item>
                                                    </Menu.Items>
                                                </Transition>
                                            </Menu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className='text-center mt-20 text-3xl'>:(</p>
            )}
        </>
    );
}

export default BoardsList;