import { Server } from "socket.io"; // Importamos el tipo Server de socket.io, que nos permite interactuar con el servidor de WebSockets

// backend/socket.ts
class Sockets {
  io: Server;
  connectedServers: Set<string>;

  constructor(io) {
    this.io = io;
    this.connectedServers = new Set();
    this.socketsEvents();
  }

  socketsEvents() {
    this.io.on("connection", (socket) => {
      console.log(`Cliente conectado :)`);
      let serverAPIKey = socket.handshake.query.serverAPIKey;

      // Verificar si serverId es un arreglo y obtener el primer elemento si es necesario
      if (Array.isArray(serverAPIKey)) {
        serverAPIKey = serverAPIKey[0];
      }

      const clientType = socket.handshake.query.type;

      if (serverAPIKey && clientType === "server") {
        // Si es una conexión de servidor
        socket.join(serverAPIKey);
        this.connectedServers.add(serverAPIKey); // Registrar el servidor
        console.log(`Servidor ${serverAPIKey} conectado`);

        this.io.to(serverAPIKey).emit("server-connected", {
          message: "Servidor conectado",
          serverAPIKey,
          online: true,
        });

        socket.on("disconnect", () => {
          if (Array.isArray(serverAPIKey)) {
            serverAPIKey = serverAPIKey[0];
          }

          console.log(`Servidor ${serverAPIKey} desconectado`);
          this.connectedServers.delete(serverAPIKey); // Eliminar el servidor
          this.io.to(serverAPIKey).emit("server-disconnected", {
            message: "Servidor desconectado",
            serverAPIKey,
            online: false,
          });
        });
      } else {
        // Si es una conexión de cliente
        socket.on("join-server", (serverAPIKey) => {
          socket.join(serverAPIKey);
          console.log(`Cliente ${socket.id} unido a la sala ${serverAPIKey}`);

          // Enviar el estado actual del servidor al cliente que se acaba de unir
          const isServerOnline = this.connectedServers.has(serverAPIKey);
          socket.emit("server-status", {
            message: isServerOnline
              ? "Servidor conectado"
              : "Servidor desconectado",
              serverAPIKey,
            online: isServerOnline,
          });
        });
      }
    });
  }
}

export default Sockets;
