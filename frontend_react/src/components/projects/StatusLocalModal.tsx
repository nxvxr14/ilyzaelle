import { getStatusLocal } from "@/api/ProjectApi";
import { updateActiveBoardById } from '@/api/BoardApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from "react-router-dom";
import { Board } from "@/types/index";
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { SocketContext } from '@/context/SocketContext';

// no funciono, revisar mas adelante, esto iba donde esta board en la function
// type BoardsListProps = {
//     boards: Board[]
// }

function StatusLocalModal({ boards, server }: { boards: Board[]; server: string }) {
    console.log(boards, server)

    // para ahorrar la delaracion lo hice en SocketContext.tsx, de lo contrario deberia hacerlo asi
    // const { socket, online } = useContext(SocketContext);
    // me ahorro el argumento de la funcion
    const { online } = useContext(SocketContext)

    const params = useParams();
    const projectId = params.projectId!;

    const queryClient = useQueryClient();

    // const { mutate } = useMutation({
    //     mutationFn: updateActiveBoardById,
    //     onError: (error) => {
    //         toast.error(error.message);
    //     },
    //     onSuccess: (data) => {
    //         toast.error('local host desconectado');
    //         queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    //     }
    // });

    // useEffect(() => {
    //     socket.on('current-status', (data) => {
    //         console.log(data)
    //     })
    // }, [socket]);

    return (
        <div>
            <div
                className={`inline-block px-4 py-2 rounded-lg text-center text-white text-sm 
          ${online ? 'bg-green-500' : 'bg-red-500'}`}
            >
                {online ? 'En Línea' : 'Desconectado'}
            </div>
        </div>
    );
}
export default StatusLocalModal;

/*
        useEffect(() => {
            const socketConnection = io(`http://${server}`, {
                transports: ['websocket'], // Forzar WebSocket como transporte
            });
            // Establecer el socket en el estado
            setSocket(socketConnection);
            // Escuchar el evento de conexión
            socketConnection.on('connect', () => {
                setOnline(true); // Actualizar el estado de conexión a "true" cuando se conecte
            });
            // Escuchar el evento de desconexión
            socketConnection.on('disconnect', () => {
                setOnline(false); // Actualizar el estado de conexión a "false" cuando se desconecte
                boards.forEach(board => {
                    if (!board.active) return;
                    const updatedData = {
                        projectId,
                        boardId: board._id,
                        active: false
                    };
                    console.log("mutate");
    
                    mutate(updatedData); // Se llama a la mutación solo cuando hay un error
                });
            });
            // Limpiar la conexión al desmontar el componente en caso que no necesitemos mas la conexion
            // return () => {
            //     socketConnection.disconnect();
            // };
        }, [server, boards]);
    */


/* utlimo

import { getStatusLocal } from "@/api/ProjectApi";
import { updateActiveBoardById } from '@/api/BoardApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from "react-router-dom";
import { Board } from "@/types/index";
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";

// no funciono, revisar mas adelante, esto iba donde esta board en la function
// type BoardsListProps = {
//     boards: Board[]
// }

function StatusLocalModal({ boards, server }: { boards: Board[]; server: string }) {
const connectSocketServer = () => {
const socket = io(`http://${server}`, {
    transports: ['websocket'], // Forzar WebSocket como transporte
})
return socket
}

const [socket, setSocket] = useState(connectSocketServer()); // estado para el socket
const [online, setOnline] = useState(false); // estado para el estado de conexión

const params = useParams();
const projectId = params.projectId!;

const queryClient = useQueryClient();

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
setOnline(socket.connected); // Actualiza el estado a conectado cuando la conexión se haya establecido
// cuando ya no necesite trabajar mas con el socket, pero no es el caso de esta aplicacion
// return socket.disconnect;
}, [socket]);

useEffect(() => {
socket.on('connect', () => {
    setOnline(true);
})
}, [socket]);

useEffect(() => {
socket.on('disconnect', () => {
    setOnline(false);
})
}, [socket]);

useEffect(() => {
socket.on('current-status', (data) => {
    console.log(data)
})
}, [socket]);

return (
<div>
    <div
        className={`inline-block px-4 py-2 rounded-lg text-center text-white text-sm 
  ${online ? 'bg-green-500' : 'bg-red-500'}`}
    >
        {online ? 'En Línea' : 'Desconectado'}
    </div>
</div>
);
}
export default StatusLocalModal;
*/