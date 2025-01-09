import { useContext } from 'react';
import { SocketContext } from '@/context/SocketContext';

function StatusLocalModal() {
    // para ahorrar la delaracion lo hice en SocketContext.tsx, de lo contrario deberia hacerlo asi
    // const { socket, online } = useContext(SocketContext);
    // me ahorro el argumento de la funcion
    const { online } = useContext(SocketContext)

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