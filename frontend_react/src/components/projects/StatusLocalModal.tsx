/*
import { getStatusLocal } from "@/api/ProjectApi";
import { updateActiveBoardById } from '@/api/BoardApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from "react-router-dom";
import { Board } from "@/types/index";
import { toast } from 'react-toastify';

type BoardsListProps = {
    boards: Board[]
}

function StatusLocalModal({ boards }: BoardsListProps) {

    const params = useParams()
    // con ! le decimos a ts que ese valor siempre va a venir en el param
    const projectId = params.projectId!

    // // elimia informacion cacheada para realizar otra consulta
    const queryClient = useQueryClient()


    const { data: statusData, isError: statusError} = useQuery({
        queryKey: ['apiLocalStatus'],
        queryFn: getStatusLocal,
        refetchInterval: 5000,
        retry: false
    })

    console.log(statusError);
    

    const { mutate } = useMutation({
        mutationFn: updateActiveBoardById,
        onError: (error) => {
            toast.error(error.message)

        },
        onSuccess: (data) => {
            toast.success(data)
            // queryClient.invalidateQueries({ queryKey: ['board', boardId] })
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
            // navigate(location.pathname, { replace: true })
        }
    })

    const handleUpdateBoards = () => {
        if (statusError) {
            boards.forEach(board => {
                if (board.active) return;
                const updatedData = {
                    projectId,
                    boardId: board._id,
                    active: false // Cambié el valor de `active` a `false` cuando `isError` es true
                };
                mutate(updatedData); // Se llama a la mutación para actualizar el estado de `active`
            });
        }
    };

    if (statusError) {
        handleUpdateBoards();
    }

    return (
        <div>
            hola
        </div>
    );
}

export default StatusLocalModal;

*/

import { getStatusLocal } from "@/api/ProjectApi";
import { updateActiveBoardById } from '@/api/BoardApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from "react-router-dom";
import { Board } from "@/types/index";
import { toast } from 'react-toastify';
import { useEffect } from 'react';

// no funciono, revisar mas adelante, esto iba donde esta board en la function
// type BoardsListProps = {
//     boards: Board[]
// }

function StatusLocalModal({ boards, server }: { boards: Board[]; server: string }) {
    const params = useParams();
    const projectId = params.projectId!;

    const queryClient = useQueryClient();

    const { data = {}, isError } = useQuery({
        queryKey: ['apiLocalStatus'],
        queryFn: () => getStatusLocal(server),
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

    useEffect(() => {
        if (isError) {
            boards.forEach(board => {
                if (!board.active) return;
                const updatedData = {
                    projectId,
                    boardId: board._id,
                    active: false
                };
                mutate(updatedData); // Se llama a la mutación solo cuando hay un error
            });
        }
    }, [isError]);

    return (
        <div>
            <div
                className={`inline-block px-4 py-2 rounded-lg text-center text-white text-sm 
              ${isError ? 'bg-red-500' : 'bg-green-500'}`}
            >
                {isError ? 'off' : 'En Línea'}
            </div>
        </div>
    );

}

export default StatusLocalModal;
