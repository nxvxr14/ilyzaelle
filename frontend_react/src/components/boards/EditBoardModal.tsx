import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Board, BoardFormData } from '@/types/index';
import BoardForm from './BoardForm';
import { updateBoardById } from '@/api/BoardApi';
import { toast } from 'react-toastify';

type EditBoardModalProps = {
    data: Board
    boardId: Board['_id']
}

export default function EditTaskModal({ data, boardId }: EditBoardModalProps) {

    const navigate = useNavigate()

    // en addboardmodal en vez de usar generic se uso initailValues y a este se le dio el formato boarformdata, esta es otra manera de hacerlo, es lo mismo
    const { register, handleSubmit, reset, formState: { errors } } = useForm<BoardFormData>({
        defaultValues: {
            boardName: data.boardName,
            boardType: data.boardType,
            boardConnect: data.boardConnect,
            boardInfo: data.boardInfo
        }
    });

    // elimia informacion cacheada para realizar otra consulta
    const queryClient = useQueryClient()

    const params = useParams()
    const projectId = params.projectId!
    // console.log(projectId);

    //para ejecutar el update
    const { mutate } = useMutation({
        mutationFn: updateBoardById,
        onError: (error) => {
            toast.error(error.message)

        },
        onSuccess: (data) => {
            toast.success(data),
                // con esto reinicio el formulario
                // reset()
                queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                queryClient.invalidateQueries({ queryKey: ['editBoard', boardId] })
            reset()
            navigate(location.pathname, { replace: true })
        }

    })

    const handleEditBoard = (formData: BoardFormData) => {
        const data = {
            projectId,
            boardId,
            formData
        }
        mutate(data)
    }

    return (
        <Transition appear show={true} as={Fragment}>
            {/* con pathname quitamos los query paramtros  */}
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
                                    Editar Tarea
                                </Dialog.Title>

                                <p className="text-xl font-bold">Realiza cambios a una tarea en {''}
                                    <span className="text-fuchsia-600">este formulario</span>
                                </p>

                                <form
                                    className="mt-10 space-y-3"
                                    noValidate
                                    onSubmit={handleSubmit(handleEditBoard)}
                                >

                                    {/* en useForm se recibe la data y en el form se envia como register */}
                                    <BoardForm register={register} errors={errors} />

                                    <input
                                        type="submit"
                                        className=" bg-fuchsia-600 hover:bg-fuchsia-700 w-full p-3  text-white font-black  text-xl cursor-pointer"
                                        value='Guardar Tarea'
                                    />
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
