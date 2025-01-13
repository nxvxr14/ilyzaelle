// useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (serverAPI: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState<boolean>(false);

  useEffect(() => {
    if (serverAPI) {
      const socket = io(import.meta.env.VITE_SOCKET_SERVER, {
        transports: ["websocket"],
      });

      setSocket(socket);

      socket.on("connect", () => {
        console.log(`Conectado a servidor: ${serverAPI}`);
        socket.emit("join-server", serverAPI);
      });

      socket.on("disconnect", () => {
        console.log(`Desconectado del servidor: ${serverAPI}`);
        setOnline(false);
      });

      // Manejar el estado inicial del servidor
      socket.on("server-status", (data) => {
        console.log("Estado inicial del servidor:", data);
        setOnline(data.online);
      });

      socket.on("server-connected", (data) => {
        console.log(data.message);
        setOnline(true);
      });

      socket.on("server-disconnected", (data) => {
        console.log(data.message);
        setOnline(false);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [serverAPI]);

  return {
    socket,
    online,
  };
};
