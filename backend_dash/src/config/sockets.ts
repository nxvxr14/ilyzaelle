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
      console.log(`Cliente conectado: ${socket.id}`);
      console.log(socket.handshake.query.serverId);

      let serverId = socket.handshake.query.serverId;

      // Verificar si serverId es un arreglo y obtener el primer elemento si es necesario
      if (Array.isArray(serverId)) {
        console.log("si")
        serverId = serverId[0];
      }

      const clientType = socket.handshake.query.type;

      if (serverId && clientType === "server") {
        // Si es una conexión de servidor
        socket.join(serverId);
        this.connectedServers.add(serverId); // Registrar el servidor
        console.log(`Servidor ${serverId} conectado`);

        this.io.to(serverId).emit("server-connected", {
          message: "Servidor conectado",
          serverId,
          online: true,
        });

        socket.on("disconnect", () => {
          if (Array.isArray(serverId)) {
            serverId = serverId[0];
          }

          console.log(`Servidor ${serverId} desconectado`);
          this.connectedServers.delete(serverId); // Eliminar el servidor
          this.io.to(serverId).emit("server-disconnected", {
            message: "Servidor desconectado",
            serverId,
            online: false,
          });
        });
      } else {
        // Si es una conexión de cliente
        socket.on("join-server", (serverId) => {
          socket.join(serverId);
          console.log(`Cliente ${socket.id} unido a la sala ${serverId}`);

          // Enviar el estado actual del servidor al cliente que se acaba de unir
          const isServerOnline = this.connectedServers.has(serverId);
          socket.emit("server-status", {
            message: isServerOnline
              ? "Servidor conectado"
              : "Servidor desconectado",
            serverId,
            online: isServerOnline,
          });
        });
      }
    });
  }
}

export default Sockets;
