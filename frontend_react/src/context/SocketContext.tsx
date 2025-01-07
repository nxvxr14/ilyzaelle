// socketcontext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  online: boolean;
  setServer: (server: string) => void;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  online: false,
  setServer: () => {},
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [server, setServer] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (server) {
      const newSocket = io(`http://${server}`, {
        transports: ["websocket"],
      });
      setSocket(newSocket);
      setOnline(newSocket.connected);

      newSocket.on("connect", () => setOnline(true));
      newSocket.on("disconnect", () => setOnline(false));

      return () => {
        newSocket.disconnect();
      };
    }
  }, [server]);

  return (
    <SocketContext.Provider value={{ socket, online, setServer }}>
      {children}
    </SocketContext.Provider>
  );
};

// para acceder al componente desde cualquier lugar de la aplicacion facilmente
export const useSocketContext = () => useContext(SocketContext);

