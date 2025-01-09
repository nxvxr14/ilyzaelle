import { useContext, useEffect } from 'react';
import { SocketContext } from '@/context/SocketContext';
import { useParams } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateProjectStatusBydId } from '@/api/ProjectApi';
import { toast } from 'react-toastify';

function StatusLocalModal() {
    // para ahorrar la delaracion lo hice en SocketContext.tsx, de lo contrario deberia hacerlo asi
    // const { socket, online } = useContext(SocketContext);
    // me ahorro el argumento de la funcion
    const { online } = useContext(SocketContext)

    const params = useParams();
    const projectId = params.projectId!;
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: updateProjectStatusBydId,
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (data) => {
            online ? toast.success('local host conectado') : toast.error('local host desconectado');
            queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
        }
    });

    useEffect(() => {
        //BU SIN SOLUCION AUN 
        mutate({ projectId, status: online }); // Se llama a la mutación solo cuando hay un error
    }, [online]);


    return (
        <div>
            <div
                className={`inline-block px-4 py-2 rounded-lg text-center text-white text-sm 
          ${online ? 'bg-green-500' : 'bg-red-500'}`}
            >
                {online ? 'en linea' : 'desconectado'}
            </div>
        </div>
    );
}
export default StatusLocalModal;