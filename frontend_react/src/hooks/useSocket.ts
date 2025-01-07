// useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (server: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (server) {
      // Crea una nueva conexión cuando el servidor cambia
      const socket = io(`http://${server}`, {
        transports: ["websocket"],
      });

      setSocket(socket);
      setOnline(socket.connected);

      socket.on("connect", () => {
        setOnline(true);
      });

      socket.on("disconnect", () => {
        setOnline(false);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [server]);

  return {
    socket,
    online,
  };
};
