import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Board, Project } from '@/types/index';
import { toast } from 'react-toastify';
import { updateCodeBoardById } from '@/api/BoardApi';

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
            navigate(`/projects/${projectId}`, { replace: true })
        }

    })

    const handleCodeEditorBoard = () => {
        const data = {
            projectId,
            boardId,
            boardCode
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