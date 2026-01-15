import { updateActiveBoardById } from '@/api/BoardApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from "react-router-dom";
import { Board } from "@/types/index";
import { toast } from 'react-toastify';
import { useEffect, useContext, useState, useRef } from "react";
import { SocketContext } from '@/context/SocketContext';

function StatusLocalModal({ boards, server }: { boards: Board[]; server: string }) {
    const params = useParams();
    const projectId = params.projectId!;
    const queryClient = useQueryClient();
    const { getStatusLocalViaSocket, online } = useContext(SocketContext);
    const [isLocalOnline, setIsLocalOnline] = useState<boolean | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

    // Check status via socket periodically
    useEffect(() => {
        const checkStatus = async () => {
            const response = await getStatusLocalViaSocket();
            setIsLocalOnline(response.online);
            
            // If not online, deactivate active boards
            if (!response.online) {
                boards.forEach(board => {
                    if (!board.active) return;
                    const updatedData = {
                        projectId,
                        boardId: board._id,
                        active: false
                    };
                    mutate(updatedData);
                });
            }
        };

        // Initial check
        if (online) {
            checkStatus();
        }

        // Set up interval for periodic checks (every 5 seconds)
        intervalRef.current = setInterval(() => {
            if (online) {
                checkStatus();
            }
        }, 5000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [online, boards, projectId, getStatusLocalViaSocket, mutate]);

    return (
        <>
        </>
    );
}
export default StatusLocalModal;