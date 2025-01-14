import { Server } from "socket.io";

class Sockets {
  io: Server;
  connectedServers: Set<string>;

  constructor(io) {
    this.io = io;
    this.connectedServers = new Set();
    this.socketsEvents();
  }

  // Evento principal de conexión
  socketsEvents() {
    // Evento principal de conexión
    this.io.on("connection", (socket) => {
      console.log("Cliente conectado :)", socket.id);

      // Extraer serverAPIKey de los parámetros de conexión
      let serverAPIKey = socket.handshake.query.serverAPIKey;

      // Asegurarse de que serverAPIKey sea un string
      if (Array.isArray(serverAPIKey)) {
        serverAPIKey = serverAPIKey[0];
      }

      // Obtener el tipo de cliente (server o frontend)
      const clientType = socket.handshake.query.type;

      // Manejar conexión del backend_local (tipo server)
      if (serverAPIKey && clientType === "server") {
        // Unir el socket a una sala con el serverAPIKey
        socket.join(serverAPIKey);
        this.connectedServers.add(serverAPIKey);
        console.log(`Servidor ${serverAPIKey} conectado`);

        // Notificar a todos los clientes en la sala que el servidor está conectado
        this.io.to(serverAPIKey).emit("server-connected", {
          message: "Servidor conectado",
          serverAPIKey,
          online: true,
        });

        socket.on("response-gVar-update-b-b", (data) => {
          this.io.emit("response-gVar-update-b-f", data);
        });

        // Manejar desconexión del servidor
        socket.on("disconnect", () => {
          if (Array.isArray(serverAPIKey)) {
            serverAPIKey = serverAPIKey[0];
          }

          console.log(`Servidor ${serverAPIKey} desconectado`);
          this.connectedServers.delete(serverAPIKey);

          // Notificar a todos los clientes en la sala que el servidor se desconectó
          this.io.to(serverAPIKey).emit("server-disconnected", {
            message: "Servidor desconectado",
            serverAPIKey,
            online: false,
          });
        });
      } else {
        // Manejar conexión del frontend

        socket.on("request-gVar-update-f-b", (projectId) => {
          this.io.emit("request-gVar-update-b-b", projectId);
        });

        socket.on("request-gVariable-delete-f-b", (projectId, key) => {
          console.log(projectId, key);
          this.io.emit("request-gVariable-delete-f-b", projectId, key);
        });

        // Manejar solicitud de unión a un servidor específico
        socket.on("join-server", (serverAPIKey) => {
          socket.join(serverAPIKey);
          console.log(`Cliente ${socket.id} unido a la sala ${serverAPIKey}`);

          // Enviar estado actual del servidor al cliente
          const isServerOnline = this.connectedServers.has(serverAPIKey);
          socket.emit("server-status", {
            message: isServerOnline
              ? "Servidor conectado"
              : "Servidor desconectado",
            serverAPIKey,
            online: isServerOnline,
          });
        });

        // Manejar desconexión del cliente frontend
        socket.on("disconnect", () => {
          console.log(`Cliente ${socket.id} desconectado`);
        });
      }

      // Eventos comunes para ambos tipos de clientes
      socket.on("error", (error) => {
        console.error("Error en socket:", error);
      });
    });
  }

  // Método auxiliar para emitir a una sala específica
  emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  // Método para verificar si un servidor está conectado
  isServerConnected(serverAPIKey: string): boolean {
    return this.connectedServers.has(serverAPIKey);
  }

  // Método para obtener el número de servidores conectados
  getConnectedServersCount(): number {
    return this.connectedServers.size;
  }
}

export default Sockets;
