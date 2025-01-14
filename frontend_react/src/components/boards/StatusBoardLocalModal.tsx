import { getStatusLocal } from "@/api/ProjectApi";
import { updateActiveBoardById } from '@/api/BoardApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from "react-router-dom";
import { Board } from "@/types/index";
import { toast } from 'react-toastify';
import { useEffect } from "react";

function StatusLocalModal({ boards, host }: { boards: Board[]; host: string }) {
    // function StatusLocalModal({ boards, server }: { boards: Board[]; server: string }) {
    // para ahorrar la delaracion lo hice en SocketContext.tsx, de lo contrario deberia hacerlo asi
    // const { socket, online } = useContext(SocketContext);
    // me ahorro el argumento de la funcion
    const params = useParams();
    const projectId = params.projectId!;
    const queryClient = useQueryClient();

    const { data = {}, isError, isFetching } = useQuery({
        queryKey: ['apiLocalStatus'],
        queryFn: () => getStatusLocal(host),
        refetchInterval: 5000,
        retry: false
    });

    const { mutate } = useMutation({
        mutationFn: updateActiveBoardById,
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (data) => {
            toast.error('local host desconectado');
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        }
    });

    // con isFetcing puedo saber cuando se esta ejecutando la queryFn y asi poder actualizar el estado de la board cuando el servidor este caido
    useEffect(() => {
        if (isError) {
            boards.forEach(board => {
                if (!board.active) return
                const updatedData = {
                    projectId,
                    boardId: board._id,
                    active: false
                };
                mutate(updatedData); // Se llama a la mutación solo cuando hay un error
            });
        }
    }, [isFetching]);

    return (
        <>
        </>
    );
}
export default StatusLocalModal;