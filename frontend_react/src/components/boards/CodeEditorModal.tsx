import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Board, Project } from '@/types/index';
import { toast } from 'react-toastify';
import { updateCodeBoardById } from '@/api/BoardApi';
import { useContext } from 'react';
import { SocketContext } from '@/context/SocketContext';

type CodeEditorModalProps = {
    projectId: Project['_id'],
    boardId: Board['_id']
    boardCode: string,
}

function CodeEditorModal({ boardCode, projectId, boardId }: CodeEditorModalProps) {
    const { pollingCodesViaSocket } = useContext(SocketContext);

    // Query client for cache invalidation
    const queryClient = useQueryClient();

    // Mutation for code updates
    const { mutate } = useMutation({
        mutationFn: updateCodeBoardById,
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: ['CodeEditorBoard', boardId] });
        }
    });

    // Handle code burning with connection check via socket
    const handleCodeEditorBoard = async () => {
        const data = {
            projectId,
            boardId,
            boardCode
        };

        const pollingDataCodes = {
            project: projectId,
            _id: boardId,
            boardCode: boardCode
        };

        const response = await pollingCodesViaSocket(pollingDataCodes);
        
        if (!response.success) {
            const errorMsg = response.error || "Error de conexión con el servidor local";
            return toast.error(errorMsg);
        }

        toast.success("Código enviado correctamente");
        mutate(data);
    };

    // Handle code update without connection check
    const handleCodeEditorBoardOFF = async () => {
        const data = {
            projectId,
            boardId,
            boardCode
        };
        mutate(data);
    };

    return (
        <>
            <button
                className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2 rounded-lg transition-colors shadow-sm"
                onClick={handleCodeEditorBoard}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                BURN
            </button>
            
            <button
                className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium p-2 rounded-lg transition-colors shadow-sm"
                onClick={handleCodeEditorBoardOFF}
                title="Guardar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
            </button>
        </>
    );
}

export default CodeEditorModal;