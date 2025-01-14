import { useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface UseGlobalVarActionsProps {
    socket: Socket | null;
    projectId: string;
}

export const useGlobalVarActionsModal = ({ socket, projectId }: UseGlobalVarActionsProps) => {

    // const handleSave = useCallback((key: string, gVarData: any) => {
    //     navigate(location.pathname + '?saveGlobalVar=true')
    //     console.log(projectId, key, gVarData[key]);
    //     // console.log(`Guardando variable: ${key}`);
    //     // if (socket) {
    //     //     socket.emit('save-variable', projectId, key);
    //     // }
    // }, [socket, projectId]);

    const handleDelete = useCallback((key: string) => {
        console.log(`Eliminando variable: ${key}`);
        if (socket) {
            socket.emit('request-gVariable-delete-f-b', projectId, key);
        }
    }, [socket, projectId]);

    return {
        // handleSave,
        handleDelete
    };
};