import { Fragment, useContext } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddGlobalVarForm from './AddGlobalVarForm';
import { AddGlobalVarFormData } from '@/types/index';
import { SocketContext } from '@/context/SocketContext';

export default function AddGlobalVarModal() {
    const { socket } = useContext(SocketContext)

    // para quitar el parametro de la url 
    const navigate = useNavigate()

    // con todo este codigo puedo leer los datos que se envian por medio de la url
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const modalGlobalVar = queryParams.get('newGlobalVar')
    const show = modalGlobalVar ? true : false

    //para obtener el projectid del url por si lo necesito
    const params = useParams()
    const projectId = params.projectId!

    // elimia informacion cacheada para realizar otra consulta
    const queryClient = useQueryClient()

    //boardForm exige que le pasemos datos, asi que le enviamos los valores iniciales por medio de useForm
    const initialValues: AddGlobalVarFormData = {
        nameGlobalVar: '',
        initialValue: 0,
        typeGlobalVar: ''
    };

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
        defaultValues: initialValues
    });

    const handleAddGlobalVar = (formData: AddGlobalVarFormData) => {
        const { nameGlobalVar, initialValue } = formData;
        console.log(formData)
        if (socket) socket.emit('request-gVarriable-initialize-f-b', projectId, nameGlobalVar, initialValue);
        queryClient.invalidateQueries({ queryKey: ['project'] })
        reset();
        navigate(location.pathname, { replace: true })
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
                                            Nueva variable global
                                        </Dialog.Title>
                                        <p className="text-lg text-gray-600">
                                            Completa los datos para crear una nueva variable global
                                        </p>
                                    </div>

                                    <form
                                        className='mt-8 space-y-5'
                                        onSubmit={handleSubmit(handleAddGlobalVar)}
                                        noValidate
                                    >
                                        <AddGlobalVarForm
                                            register={register}
                                            errors={errors}
                                            setValue={setValue}
                                        />
                                        <div className="pt-4">
                                            <input
                                                type="submit"
                                                value='Agregar Variable'
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
