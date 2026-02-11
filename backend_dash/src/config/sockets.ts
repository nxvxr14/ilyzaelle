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

        // Modificar para enviar solo a la sala específica
        socket.on("response-gVar-update-b-b", (data, projectId) => {
          if (!projectId) return;
          // Enviando solo a la sala específica basada en el serverAPIKey
          this.io.to(serverAPIKey).emit("response-gVar-update-b-f", data, serverAPIKey);
          console.log(`Backend local ${serverAPIKey} responded with data for project ${projectId}`);
        });

        // Response from backend_local for polling boards
        socket.on("response-polling-boards-b-b", (data, requestId) => {
          this.io.to(serverAPIKey).emit("response-polling-boards-b-f", data, requestId);
          console.log(`Backend local ${serverAPIKey} responded to polling boards request ${requestId}`);
        });

        // Response from backend_local for polling codes
        socket.on("response-polling-codes-b-b", (data, requestId) => {
          this.io.to(serverAPIKey).emit("response-polling-codes-b-f", data, requestId);
          console.log(`Backend local ${serverAPIKey} responded to polling codes request ${requestId}`);
        });

        // Response from backend_local for status local
        socket.on("response-status-local-b-b", (data, requestId) => {
          this.io.to(serverAPIKey).emit("response-status-local-b-f", data, requestId);
          console.log(`Backend local ${serverAPIKey} responded to status local request ${requestId}`);
        });

        // Relay new server.log lines from backend_local to frontend
        socket.on("response-server-log-b-b", (line) => {
          console.log(`[LogRelay] Relaying log to room ${serverAPIKey}: ${String(line).substring(0, 80)}`);
          this.io.to(serverAPIKey).emit("response-server-log-b-f", line);
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

        /** EVENTOS DE SOCKET **/
        socket.on("request-gVar-update-f-b", (projectId, clientServerAPIKey) => {
          // Modificado: Enviar solo al servidor específico que coincide con clientServerAPIKey
          if (clientServerAPIKey && this.connectedServers.has(clientServerAPIKey)) {
            this.io.to(clientServerAPIKey).emit("request-gVar-update-b-b", projectId);
            console.log(`Frontend requesting data for project ${projectId} from server ${clientServerAPIKey}`);
          } else {
            console.log(`No server available for API key: ${clientServerAPIKey}`);
            // Notificar al cliente que no hay servidor disponible
            socket.emit("no-server-available", { projectId, serverAPIKey: clientServerAPIKey });
          }
        });

        socket.on("request-gVariable-delete-f-b", (projectId, key, clientServerAPIKey) => {
          if (clientServerAPIKey) {
            this.io.to(clientServerAPIKey).emit("request-gVariable-delete-b-b", projectId, key);
          }
        });

        socket.on(
          "request-gVariable-change-f-b",
          (selectedVar, inputVar, projectId, clientServerAPIKey) => {
            if (clientServerAPIKey) {
              this.io.to(clientServerAPIKey).emit(
                "request-gVariable-change-b-b",
                selectedVar,
                inputVar,
                projectId
              );
            }
          }
        );

        socket.on(
          "request-gVarriable-initialize-f-b",
          (projectId, nameGlobalVar, initialValue, clientServerAPIKey) => {
            if (clientServerAPIKey) {
              this.io.to(clientServerAPIKey).emit(
                "request-gVarriable-initialize-b-b",
                projectId,
                nameGlobalVar,
                initialValue
              );
            }
          }
        );

        // New event: Request polling boards from frontend to backend_local
        socket.on("request-polling-boards-f-b", (pollingData, clientServerAPIKey, requestId) => {
          if (clientServerAPIKey && this.connectedServers.has(clientServerAPIKey)) {
            this.io.to(clientServerAPIKey).emit("request-polling-boards-b-b", pollingData, requestId);
            console.log(`Frontend requesting polling boards from server ${clientServerAPIKey}`);
          } else {
            console.log(`No server available for polling boards, API key: ${clientServerAPIKey}`);
            socket.emit("response-polling-boards-b-f", { 
              success: false, 
              error: "Server not available" 
            }, requestId);
          }
        });

        // New event: Request polling codes from frontend to backend_local
        socket.on("request-polling-codes-f-b", (pollingDataCodes, clientServerAPIKey, requestId) => {
          if (clientServerAPIKey && this.connectedServers.has(clientServerAPIKey)) {
            this.io.to(clientServerAPIKey).emit("request-polling-codes-b-b", pollingDataCodes, requestId);
            console.log(`Frontend requesting polling codes from server ${clientServerAPIKey}`);
          } else {
            console.log(`No server available for polling codes, API key: ${clientServerAPIKey}`);
            socket.emit("response-polling-codes-b-f", { 
              success: false, 
              error: "Server not available" 
            }, requestId);
          }
        });

        // New event: Request status local from frontend to backend_local
        socket.on("request-status-local-f-b", (clientServerAPIKey, requestId) => {
          if (clientServerAPIKey && this.connectedServers.has(clientServerAPIKey)) {
            this.io.to(clientServerAPIKey).emit("request-status-local-b-b", requestId);
            console.log(`Frontend requesting status local from server ${clientServerAPIKey}`);
          } else {
            console.log(`No server available for status local, API key: ${clientServerAPIKey}`);
            socket.emit("response-status-local-b-f", { 
              online: false, 
              error: "Server not available" 
            }, requestId);
          }
        });
        /** EVENTOS DE SOCKET **/

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
