import { useSocket } from "@/hooks/useSocket";
import { ReactNode, createContext } from "react";
import { Socket } from "socket.io-client";

// Define the context type
// interface SocketContextType {
//   socket: Socket | null;
//   online: boolean;
// }

interface SocketProviderProps {
  children: ReactNode;
  server: string
}

// en javascript permite inicializar createContext en undefined, en ts toca inicializarlo
// export const SocketContext = createContext<SocketContextType>({
//   socket: null,
//   online: false
// });

export const SocketContext = createContext({})

export const SocketProvider = ({ children, server }: SocketProviderProps) => {
  const { socket, online } = useSocket(server)
  return (
    <SocketContext.Provider value={{ socket, online }}>
      {children}
    </SocketContext.Provider>
  )
}