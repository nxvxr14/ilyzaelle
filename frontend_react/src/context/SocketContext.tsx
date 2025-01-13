// SocketContext.tsx
import { createContext, useContext, ReactNode, useState } from "react";
import { Socket } from "socket.io-client";
import { useSocket } from "@/hooks/useSocket"; // Asegúrate de importar el hook que hemos creado.

interface SocketContextType {
  socket: Socket | null;
  online: boolean;
  setServerAPI: (serverAPI: string) => void;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  online: false,
  setServerAPI: () => { },
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [serverAPI, setServerAPI] = useState<string>('');

  // Usamos el hook useSocket que se encargará de la lógica de conexión
  const { socket, online } = useSocket(serverAPI);

  return (
    <SocketContext.Provider value={{ socket, online, setServerAPI }}>
      {children}
    </SocketContext.Provider>
  );
};

// para acceder al contexto desde cualquier lugar de la aplicación
// export const useSocketContext = () => useContext(SocketContext);
