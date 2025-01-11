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
    console.log("react")

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
        if (socket) socket.emit('initialize-gVar', projectId, nameGlobalVar, initialValue);
        queryClient.invalidateQueries({ queryKey: ['project'] })
        reset();
        navigate(location.pathname, { replace: true })
    }

    return (
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
                                    <Dialog.Title
                                        as="h3"
                                        className="font-black text-4xl  my-5"
                                    >
                                        nueva variable
                                    </Dialog.Title>

                                    <p className="text-xl font-bold">Llena el formulario y crea  {''}
                                    </p>

                                    <form
                                        className='mt-10 space-y-3'
                                        onSubmit={handleSubmit(handleAddGlobalVar)}
                                        noValidate
                                    >
                                        <AddGlobalVarForm
                                            register={register}
                                            errors={errors}
                                            setValue={setValue}
                                        />
                                        <input
                                            type="submit"
                                            value='agregar'
                                            className='bg-black hover:bg-[#FFFF44] text-white hover:text-black w-full p-3  font-bold cursor-pointer transition-color rounded-2xl'
                                        />
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
