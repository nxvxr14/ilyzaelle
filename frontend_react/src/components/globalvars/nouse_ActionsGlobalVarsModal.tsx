import { SocketContext } from '@/context/SocketContext';
import { useCallback, useContext } from 'react';
import { Socket } from 'socket.io-client';

interface UseGlobalVarActionsProps {
    socket: Socket | null;
    projectId: string;
}

export const useGlobalVarActions = ({ projectId }: UseGlobalVarActionsProps) => {
    const { socket } = useContext(SocketContext);

    const handleSave = useCallback((key: string) => {
        console.log(`Guardando variable: ${key}`);
        if (socket) {
            socket.emit('save-variable', projectId, key);
        }
    }, [socket, projectId]);

    const handleDelete = useCallback((key: string) => {
        console.log(`Eliminando variable: ${key}`);
        if (socket) {
            socket.emit('delete-variable', projectId, key);
        }
    }, [socket, projectId]);

    return {
        handleSave,
        handleDelete
    };
};