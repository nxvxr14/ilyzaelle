import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SaveGlobalVarForm from './SaveGlobalVarForm';
import { SaveGlobalVarFormData } from "@/types/index";
import { createDataVar } from '@/api/DataVarApi';


type SaveGlobalModalProps = {
    nameGlobalVar: string
    gVar: [],
}

export default function SaveGlobalVarModal({ nameGlobalVar, gVar }: SaveGlobalModalProps) {
    // para quitar el parametro de la url 
    const navigate = useNavigate()

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
        onError: (error) => {
            toast.error(error.message)

        },
        onSuccess: (data) => {
            toast.success(data)
            // revisar esto bien
            queryClient.invalidateQueries({ queryKey: ['project'] })
            reset();
            navigate(location.pathname, { replace: true })
        }
    })

    const handleSaveGlobalVar = (formData: SaveGlobalVarFormData) => {
        const finalFormData = {
            ...formData,
            nameGlobalVar,
            gVar
        }
        const data = {
            finalFormData,
            projectId
        }
        mutate(data)
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
                                        onSubmit={handleSubmit(handleSaveGlobalVar)}
                                        noValidate
                                    >
                                        <SaveGlobalVarForm
                                            nameGlobalVar={nameGlobalVar}
                                            register={register}
                                            errors={errors}
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
