import { gVar } from "../controllers/UpdateCodeBoardController.js";

class Sockets {
  constructor(io) {
    this.io = io;
    this.socketsEvents();
  }

  socketsEvents() {
    this.io.on("connection", (socket) => {
      console.log("A new client connected:", socket.id);
      // Emitir un mensaje al cliente
      socket.emit("current-status", true, () => {
        console.log("Emitiendo mensaje al cliente desde el backend");
      });

      socket.on("projectid-dashboard", (project) => {
        console.log("projectid-dashboard", project);
        // socket.emit solo emite al cliente conectado
        // this.io emite a todos los conectados
        socket.emit("update-gVar", gVar[project]);
        const intervalId = setInterval(() => {
          socket.emit("update-gVar", gVar[project]);
        }, 1000); // Emitir cada segundo, ajusta este valor según sea necesario
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
}

export default Sockets;
