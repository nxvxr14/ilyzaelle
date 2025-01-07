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
      
      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
}

export default Sockets;
