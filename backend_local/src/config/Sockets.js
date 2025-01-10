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

      // con este socket recibo el id del projecto y actualizo los valores de gVar project en el frontend, se podria evitar recibir el id del projecto y solo actualizar gVar en el frontend???? revisar
      socket.on("projectid-dashboard", (project) => {
        console.log("projectid-dashboard", project);
        // socket.emit solo emite al cliente conectado
        // this.io emite a todos los conectados
        socket.emit("update-gVar", gVar[project]);
      });

      // si en el dashboardzoneview elegi la opcion de editar una variable global aca recibo los datos y actualizo
      socket.on("update-input-gVar", (selectedVar, inputVar, project) => {
        gVar[project][selectedVar] = inputVar;
        console.log(gVar[project][selectedVar]);
      });

      // para eliminar variables del objeto
      socket.on("delete-variable", (project, nameGlobalVar) => {
        delete gVar[project][nameGlobalVar];
        console.log("delete")
      });

      // con esto inicializo las variables globales por primera vez las que seleccione en el frontend
      socket.on("initialize-gVar", (project, nameGlobalVar, initialValue) => {
        console.log(project, nameGlobalVar, initialValue);
        gVar[project] = gVar[project] || {};
        if (gVar[project].hasOwnProperty(nameGlobalVar)) {
          console.log("true");
          return;
        }
        gVar[project][nameGlobalVar] = initialValue;
        console.log(gVar[project]);
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
}

export default Sockets;
