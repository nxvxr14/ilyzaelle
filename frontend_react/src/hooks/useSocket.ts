// useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (serverId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState<boolean>(false);

  useEffect(() => {
    if (serverId) {
      // Establecemos la conexión al servidor de WebSocket
      const socket = io(import.meta.env.VITE_SOCKET_SERVER, {
        transports: ["websocket"],
      });

      setSocket(socket);

      socket.on("connect", () => {
        console.log(`Conectado a servidor: ${serverId}`);
        socket.emit("join-server", serverId); // Unirse a la sala correspondiente
      });

      socket.on("disconnect", () => {
        console.log(`Desconectado del servidor: ${serverId}`);
      });

      socket.on("server-connected", (data) => {
        console.log(data.message);
        setOnline(true); // El servidor se conectó, marcar como online
      });

      socket.on("server-disconnected", (data) => {
        console.log(data.message);
        setOnline(false); // El servidor se desconectó, marcar como offline
      });

      return () => {
        socket.disconnect(); // Desconectar el socket cuando el componente se desmonta
      };
    }
  }, [serverId]);

  return {
    socket,
    online
  };
};
