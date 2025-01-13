import { Server } from "socket.io"; // Importamos el tipo Server de socket.io, que nos permite interactuar con el servidor de WebSockets

class Sockets {
  io: Server; // Declaramos una propiedad io que contendrá la instancia del servidor de WebSockets

  constructor(io) {
    this.io = io; // Inicializamos la propiedad io con el objeto pasado al constructor
    this.socketsEvents(); // Llamamos a la función que manejará los eventos de WebSocket
  }

  // backend/socket.ts
  socketsEvents() {
    this.io.on("connection", (socket) => {
      console.log(`Cliente conectado: ${socket.id}`);
console.log(socket.handshake.query.serverId)
      // Obtener el serverId del servidor que se pasa a través de la consulta del socket
      const serverId = socket.handshake.query.serverId;
      if (serverId) {
        // Si existe un serverId, unimos al cliente a la sala correspondiente
        socket.join(serverId);
        console.log(`Servidor ${serverId} conectado`);

        // Emitimos inmediatamente el estado de conexión a todos en la sala
        this.io.to(serverId).emit("server-connected", {
          message: "Servidor conectado",
          serverId,
          online: true, // Add this flag
        });

        // Configuramos el evento de desconexión
        socket.on("disconnect", () => {
          console.log(`Servidor ${serverId} desconectado`);
          this.io.to(serverId).emit("server-disconnected", {
            message: "Servidor desconectado",
            serverId,
            online: false, // Add this flag
          });
        });
      }

      // Recibir el serverId del cliente cuando se conecta
      socket.on("join-server", (serverId) => {
        socket.join(serverId);
        console.log(`Cliente ${socket.id} unido a la sala ${serverId}`);
      });
    });
  }
}

export default Sockets; // Exportamos la clase para poder usarla en otras partes del código
