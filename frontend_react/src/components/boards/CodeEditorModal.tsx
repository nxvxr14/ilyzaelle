import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Board, Project } from '@/types/index';
import { toast } from 'react-toastify';
import { pollingCodes, updateCodeBoardById } from '@/api/BoardApi';
import { isAxiosError } from 'axios';

type CodeEditorModalProps = {
    projectId: Project['_id'],
    boardId: Board['_id']
    boardCode: string,
}

function CodeEditorModal({ boardCode, projectId, boardId }: CodeEditorModalProps) {
    const navigate = useNavigate()

    // elimia informacion cacheada para realizar otra consulta
    const queryClient = useQueryClient()

    //para ejecutar el update
    const { mutate } = useMutation({
        mutationFn: updateCodeBoardById,
        onError: (error) => {
            toast.error(error.message)

        },
        onSuccess: (data) => {
            toast.success(data),
                queryClient.invalidateQueries({ queryKey: ['CodeEditorBoard', boardId] })
            // para navegar hacia atras
            // navigate(`/projects/${projectId}`, { replace: true })
        }

    })

    const handleCodeEditorBoard = async () => {
        const data = {
            projectId,
            boardId,
            boardCode
        }

        const pollingDataCodes = {
            project: projectId,
            _id: boardId,
            boardCode: boardCode
        }

        const response = await pollingCodes({ pollingDataCodes })
        if (isAxiosError(response)) {
            return toast.error("localhost sin conexion");
        }

        mutate(data)
    }

    return (
        <>
            <div className="py-5">
                <button
                    className='bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl'
                    onClick={handleCodeEditorBoard}
                >
                    quemar
                </button>
            </div>
        </>
    );
}

export default CodeEditorModal;