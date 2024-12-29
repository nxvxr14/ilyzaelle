import { useQuery } from "@tanstack/react-query";
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { Link, Navigate } from "react-router-dom";
import { getSnippets } from "@/api/SnippetApi";

function SnippetsList() {
    const { data, isLoading, isError } = useQuery({
        // se usa projectid en querykey para que sean unicos, no quede cacheado y no haya problemas mas adelante
        queryKey: ['snippet'],
        //cuando tengo una funcion que toma un parametro debo tener un callback
        queryFn: getSnippets
    })

    if (isLoading) return 'cargando'
    if (isError) return <Navigate to='/404' />

    if (data) return (
        <>
            <div className="">
                {data.length ? (
                    <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.map((data) => (
                            <li key={data._id} className="flex justify-between gap-x-6 p-5 border border-gray-100 bg-white shadow-lg rounded-2xl" style={{ borderTopColor: '#FFFF44', borderTopWidth: '8px' }}>
                                <div className="min-w-0 flex-auto space-y-2">
                                    {/* Mostrar snippetName, description y version */}
                                    <Link to={`/projects/${data._id}`} className="text-gray-600 cursor-pointer hover:underline text-3xl font-bold">
                                        {data.snippetName}
                                    </Link>
                                    <p className="text-sm text-gray-400">{data.description}</p>
                                    <p className="text-sm text-gray-400">{`Versión: ${data.version}`}</p>
                                    {/* Estado del proyecto */}
                                    <p className={`text-lg font-bold ${data.busy ? 'text-green-500' : 'text-red-500'}`}>
                                        {data.busy ? 'activo' : 'inactivo'}
                                    </p>
                                </div>
                                {/* Menú de opciones */}
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
                                                    {/* <Link to={`/projects/${project._id}`}
                                                    className='block px-3 py-1 text-sm leading-6 text-gray-900'>
                                                    abrir
                                                </Link> */}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {/* con esto obtenemos el valor de la id */}
                                                    {/* se lee de la url  */}
                                                    {/* <Link to={`/projects/${project._id}/edit`}
                                                    className='block px-3 py-1 text-sm leading-6 text-gray-900'>
                                                    editar
                                                </Link> */}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    <button
                                                        type='button'
                                                        className='block px-3 py-1 text-sm leading-6 text-red-500'
                                                    // onClick={() => mutate(project._id)}
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
                    <p className="text-center mt-20 text-3xl">:( No hay proyectos disponibles</p>
                )}
            </div>
        </>
    )
}

export default SnippetsList 