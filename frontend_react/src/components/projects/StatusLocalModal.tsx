// StatusLocalModal.tsx
import { useParams } from 'react-router-dom';
import { SocketContext } from '@/context/SocketContext';
import { useContext, useEffect, useState } from 'react';

function StatusLocalModal() {
    const params = useParams();
    const projectId = params.projectId!; // Obtener el serverId desde los parámetros de la URL
    const { online } = useContext(SocketContext)

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



// const { mutate } = useMutation({
//     mutationFn: updateProjectStatusBydId,
//     onError: (error) => {
//         toast.error(error.message);
//     },
//     onSuccess: (data) => {
//         online ? toast.success('local host conectado') : toast.error('local host desconectado');
//         queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
//     }
// });

// useEffect(() => {
//     //BU SIN SOLUCION AUN 
//     mutate({ projectId, status: online }); // Se llama a la mutación solo cuando hay un error
// }, [online]);