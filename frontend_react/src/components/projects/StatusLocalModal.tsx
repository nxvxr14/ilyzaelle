// StatusLocalModal.tsx
import { useParams } from 'react-router-dom';
import { SocketContext } from '@/context/SocketContext';
import { useContext, useEffect, useState, useRef } from 'react';
import { Board } from "@/types/index";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateActiveBoardById } from '@/api/BoardApi';
import { toast } from 'react-toastify';

function StatusLocalModal({ boards, server }: { boards: Board[]; server: string }) {
    const params = useParams();
    const projectId = params.projectId!; // Obtener el serverId desde los parámetros de la URL
    const { online } = useContext(SocketContext);
    const queryClient = useQueryClient();
    
    // State to store the last 5 online status samples
    const [onlineSamples, setOnlineSamples] = useState<boolean[]>([]);
    // Ref to track if we've already performed the deactivation
    const hasDeactivatedRef = useRef(false);

    // Mutation for updating board status
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

    // Effect to collect online status samples every second
    useEffect(() => {
        // Reset deactivation flag when online status changes to true
        if (online) {
            hasDeactivatedRef.current = false;
        }
        
        // Add current online status to samples
        const interval = setInterval(() => {
            setOnlineSamples(prev => {
                // Add new sample, keep only last 5
                const newSamples = [...prev, online].slice(-5);
                
                // Check if we have 5 samples and all are false
                if (newSamples.length === 5 && 
                    newSamples.every(sample => !sample) && 
                    !hasDeactivatedRef.current && 
                    boards?.length) {
                    
                    console.log('All 5 samples are offline. Deactivating boards...');
                    
                    // Deactivate all active boards
                    boards.forEach(board => {
                        if (!board.active) return;
                        const updatedData = {
                            projectId,
                            boardId: board._id,
                            active: false
                        };
                        mutate(updatedData);
                    });
                    
                    // Set flag to prevent repeated deactivations
                    hasDeactivatedRef.current = true;
                }
                
                return newSamples;
            });
        }, 1000);
        
        return () => clearInterval(interval);
    }, [online, boards, projectId, mutate]);

    return (
        <div>
            <div
                className={`inline-block px-4 py-2 rounded-lg text-center text-white text-sm
          ${online ? 'bg-green-500' : 'bg-red-500'}`}
            >
                {online ? 'en línea' : 'desconectado'}
            </div>
        </div>
    );
}

export default StatusLocalModal;