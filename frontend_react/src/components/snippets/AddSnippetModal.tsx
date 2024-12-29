import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { SnippetFormData } from '@/types/index';
import SnippetForm from './SnippetForm';
import { createSnippet } from '@/api/SnippetApi';
import { toast } from 'react-toastify';


export default function AddSnippetModal() {

    // para quitar el parametro de la url 
    const navigate = useNavigate()

    // con todo este codigo puedo leer los datos que se envian por medio de la url
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const modalSnippet = queryParams.get('newSnippet')
    const show = modalSnippet ? true : false

    //para obtener el projectid del url por si lo necesito
    // const params = useParams()
    // const projectId = params.projectId!
    // console.log(projectId);

    //boardForm exige que le pasemos datos, asi que le enviamos los valores iniciales por medio de useForm
    const initialValues: SnippetFormData = {
        snippetName: '',
        description: '',
        version: 0,
    };

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialValues
    });

    // despues de crear snippetapi vengo aca y uso usemutation
    const { mutate } = useMutation({
        // aca va la funcion de la api
        mutationFn: createSnippet,
        onError: (error) => {
            toast.error(error.message)

        },
        onSuccess: (data) => {
            toast.success(data)
            navigate(location.pathname, { replace: true })
        }
    })

    const handleCreateBoard = (formData: SnippetFormData) => {
        // console.log(formData);
        mutate(formData)
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
                                        nuevo snippet
                                    </Dialog.Title>

                                    <p className="text-xl font-bold">Llena el formulario y crea  {''}
                                    </p>

                                    <form
                                        className='mt-10 space-y-3'
                                        onSubmit={handleSubmit(handleCreateBoard)}
                                        noValidate
                                    >
                                        <SnippetForm
                                            register={register}
                                            errors={errors}

                                        />
                                        <input
                                            type="submit"
                                            value='agregar'
                                            className='bg-black hover:bg-[#FFFF44] text-white hover:text-black w-full p-3  font-bold cursor-pointer transition-color'
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
