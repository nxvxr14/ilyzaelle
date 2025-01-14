// backendlocal/Sockets.js
import { gVar } from "../controllers/UpdateCodeBoardController.js";
import { io } from "socket.io-client";

class Sockets {
  constructor(url, serverAPIKey) {
    console.log(serverAPIKey);
    this.socket = io(url, {
      transports: ["websocket"],
      query: {
        serverAPIKey,
        type: "server", // Identificamos que es una conexión de servidor
      },
    });

    this.socketsEvents();
  }

  socketsEvents() {
    this.socket.on("connect", () => {
      console.log("[devMessage] backend_local connected to Socket.IO server");
    });

    this.socket.on("disconnect", () => {
      console.log(
        "[devMessage] backend_local disconnected from Socket.IO server"
      );
    });

    // Escuchar solicitudes de actualización del frontend
    this.socket.on("request-gVar-update-b-b", (projectId) => {
      // Emitir los datos actualizados al room específico del proyecto
      this.socket.emit("response-gVar-update-b-b", gVar[projectId]);
    });

    this.socket.on("request-gVariable-delete-f-b", (projectId, key) => {
      const value = gVar[projectId][key];
      if (typeof value === "number") {
        gVar[projectId][key] = 0; // Reemplazar con 0 si es un número
      } else if (typeof value === "boolean") {
        gVar[projectId][key] = false; // Reemplazar con false si es booleano
      } else if (Array.isArray(value)) {
        gVar[projectId][key] = []; // Reemplazar con un array vacío si es un array
      }
      console.log(
        "Variable reemplazada por valor por defecto: " + gVar[projectId][key]
      );
    });
  }
}

export default Sockets;

// Escuchar solicitudes de actualización del frontend

// this.io.on("connection", (socket) => {
//   console.log("A new client connected:", socket.id);
//   // // Emitir un mensaje al cliente
//   // socket.emit("current-status", true, () => {
//   //   console.log("Emitiendo mensaje al cliente desde el backend");
//   // });

//   // con este socket recibo el id del projecto y actualizo los valores de gVar project en el frontend, se podria evitar recibir el id del projecto y solo actualizar gVar en el frontend???? revisar
//   socket.on("projectid-dashboard", (project) => {
//     console.log("projectid-dashboard", project);
//     // socket.emit solo emite al cliente conectado
//     // this.io emite a todos los conectados
//     socket.emit("update-gVar", gVar[project]);
//   });

//   // si en el dashboardzoneview elegi la opcion de editar una variable global aca recibo los datos y actualizo
//   socket.on("update-input-gVar", (selectedVar, inputVar, project) => {
//     gVar[project][selectedVar] = inputVar;
//     console.log(gVar[project][selectedVar]);
//   });

//   // para eliminar variables del objeto
//   socket.on("delete-variable", (project, nameGlobalVar) => {
//     const value = gVar[project][nameGlobalVar];
//     if (typeof value === "number") {
//       gVar[project][nameGlobalVar] = 0;  // Reemplazar con 0 si es un número
//     } else if (typeof value === "boolean") {
//       gVar[project][nameGlobalVar] = false;  // Reemplazar con false si es booleano
//     } else if (Array.isArray(value)) {
//       gVar[project][nameGlobalVar] = [];  // Reemplazar con un array vacío si es un array
//     }
//     console.log("Variable reemplazada por valor por defecto");
//   });

//   // // para guardar variables del objeto
//   // socket.on("save-variable", (project, nameGlobalVar) => {
//   //   console.log("***project, nameGlobalVar", project, nameGlobalVar);
//   // });

//   // con esto inicializo las variables globales por primera vez las que seleccione en el frontend
//   socket.on("initialize-gVar", (project, nameGlobalVar, initialValue) => {
//     console.log(project, nameGlobalVar, initialValue);
//     gVar[project] = gVar[project] || {};
//     if (gVar[project].hasOwnProperty(nameGlobalVar)) {
//       console.log("true");
//       return;
//     }
//     gVar[project][nameGlobalVar] = initialValue;
//     console.log(gVar[project]);
//   });

//   socket.on("disconnect", () => {
//     console.log(`Client disconnected: ${socket.id}`);
//   });
// });
