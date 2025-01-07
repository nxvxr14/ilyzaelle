// un hook es parecido a un funcional component
import { io } from "socket.io-client";
import { useEffect, useMemo, useState } from "react";

export const useSocket = (server: string) => {
  // necesito exponer el socker y el online

  // para que no se ejecute esto en cada render y se generan multiples conexiones al backend, se puede poner un memorize para que se vuelva a ejecuta unicamente cuando cambie el servidor
  const socket = useMemo(() => {
    return io(`http://${server}`, {
      transports: ["websocket"], // Forzar WebSocket como transporte
    });
  }, []);

  const [online, setOnline] = useState(false); // estado para el estado de conexión

  useEffect(() => {
    setOnline(socket.connected); // Actualiza el estado a conectado cuando la conexión se haya establecido
    // cuando ya no necesite trabajar mas con el socket, pero no es el caso de esta aplicacion
    // return socket.disconnect;
  }, [socket]);

  useEffect(() => {
    socket.on("connect", () => {
      setOnline(true);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("disconnect", () => {
      setOnline(false);
    });
  }, [socket]);

  return {
    socket,
    online,
  };
};
