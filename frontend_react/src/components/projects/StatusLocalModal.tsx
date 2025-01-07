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
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";

// no funciono, revisar mas adelante, esto iba donde esta board en la function
// type BoardsListProps = {
//     boards: Board[]
// }

// const connectSocketServer = () => {
//     const socket = io(`http://192.168.1.12:4040`, {
//         transports: ['websocket'] // Forzar WebSocket como transporte
//     });
//     return socket;
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


    return (
        <div>
            {/* <div
                className={`inline-block px-4 py-2 rounded-lg text-center text-white text-sm 
              ${isError ? 'bg-red-500' : 'bg-green-500'}`}
            >
                {isError ? 'off' : 'En Línea'}
            </div> */}

            <div
                className={`inline-block px-4 py-2 rounded-lg text-center text-white text-sm 
          ${online ? 'bg-green-500' : 'bg-red-500'}`}
            >
                {online ? 'En Línea' : 'Desconectado'}
            </div>
        </div>
    );

}


/*
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
*/

export default StatusLocalModal;
