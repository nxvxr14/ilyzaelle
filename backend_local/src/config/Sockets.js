// backendlocal/Sockets.js
import { gVar } from "../controllers/UpdateCodeBoardController.js";
import { io } from "socket.io-client";
import { generateBoardController } from "../controllers/GenerateBoardController.js";
import { updateCodeBoardController } from "../controllers/UpdateCodeBoardController.js";
import { startLogWatcher } from "../utils/logWatcher.js";

class Sockets {
  constructor(url, serverAPIKey) {
    console.log(`Initializing socket connection to: ${url}`);
    console.log(`Using serverAPIKey: ${serverAPIKey}`);
    this.serverAPIKey = serverAPIKey;
    this.socket = io(url, {
      transports: ["websocket"],
      query: {
        serverAPIKey,
        type: "server",
      },
    });

    this.socketsEvents();
    this.stopLogWatcher = null;
  }

  socketsEvents() {
    this.socket.on("connect", () => {
      console.log(`[devMessage] backend_local connected to Socket.IO server`);
      console.log(`[devMessage] Socket ID: ${this.socket.id}`);
      console.log(`[devMessage] API key: ${this.serverAPIKey}`);

      // Start watching server.log and emit new lines to backend_dash
      this.stopLogWatcher = startLogWatcher((line) => {
        this.socket.emit("response-server-log-b-b", line);
      });
    });

    this.socket.on("connect_error", (error) => {
      console.error(`[devMessage] Connection error: ${error.message}`);
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`[devMessage] backend_local disconnected: ${reason}`);
      // Stop watching server.log on disconnect
      if (this.stopLogWatcher) {
        this.stopLogWatcher();
        this.stopLogWatcher = null;
      }
    });

    /** EVENTOS DE SOCKET **/
    // Escuchar solicitudes de actualización del frontend
    this.socket.on("request-gVar-update-b-b", (projectId) => {
      // Ensure all arrays have their time vectors before sending data
      this.ensureArrayTimeVectors(projectId);
      
      //console.log(`Received request for gVar update for project ${projectId}`);
      
      // Check which arrays have time vectors
      if (gVar[projectId]) {
        // Emitir los datos actualizados incluyendo el projectId como referencia
        this.socket.emit("response-gVar-update-b-b", gVar[projectId], projectId);
        //console.log(`Sent gVar update for project ${projectId} with API key ${this.serverAPIKey}`);
      } else {
        // Enviar un objeto vacío para evitar errores en el frontend
        this.socket.emit("response-gVar-update-b-b", {}, projectId);
      }
    });

    this.socket.on("request-gVariable-delete-b-b", (projectId, key) => {
      if (!gVar[projectId]) {
        return;
      }
      
      const value = gVar[projectId][key];
      if (typeof value === "number") {
        gVar[projectId][key] = 0; // Reemplazar con 0 si es un número
      } else if (typeof value === "boolean") {
        gVar[projectId][key] = false; // Reemplazar con false si es booleano
      } else if (Array.isArray(value)) {
        gVar[projectId][key] = []; // Reemplazar con un array vacío si es un array
        // Si se elimina un array, también reiniciamos su vector de tiempo
        if (gVar[projectId][`${key}_time`]) {
          gVar[projectId][`${key}_time`] = [];
        }
      }
      console.log(
        `Variable ${key} en proyecto ${projectId} reemplazada por valor por defecto: ${gVar[projectId][key]}`
      );
    });

    /** EVENTOS DE SOCKET **/
    this.socket.on(
      "request-gVariable-change-b-b",
      (selectedVar, inputVar, projectId) => {
        console.log(selectedVar, inputVar, projectId);
        const oldValue = gVar[projectId][selectedVar];
        gVar[projectId][selectedVar] = inputVar;
        
        // Si es un array y ha cambiado de tamaño (se añadieron elementos), actualizamos el vector de tiempo
        if (Array.isArray(inputVar)) {
          // Ensure time vector exists
          if (!gVar[projectId][`${selectedVar}_time`]) {
            gVar[projectId][`${selectedVar}_time`] = [];
          }
          
          const timeVector = gVar[projectId][`${selectedVar}_time`];
          
          // Si es un nuevo array o ha cambiado de tamaño, ajustamos el vector de tiempo
          if (!Array.isArray(oldValue) || inputVar.length !== timeVector.length) {
            // Si el vector de tiempo es más corto que el array, añadimos nuevos timestamps
            while (timeVector.length < inputVar.length) {
              timeVector.push(Date.now());
            }
            
            // Si el vector de tiempo es más largo que el array, lo recortamos
            if (timeVector.length > inputVar.length) {
              gVar[projectId][`${selectedVar}_time`] = timeVector.slice(0, inputVar.length);
            }
            
            console.log(`Updated time vector for ${selectedVar}, new length: ${gVar[projectId][`${selectedVar}_time`].length}`);
          }
        }
        
        console.log(gVar[projectId][selectedVar]);
      }
    );

    this.socket.on("request-gVarriable-initialize-b-b", (projectId, nameGlobalVar, initialValue) => {
      console.log("Initializing variable:", projectId, nameGlobalVar);
      gVar[projectId] = gVar[projectId] || {};
      if (gVar[projectId].hasOwnProperty(nameGlobalVar)) {
        console.log("Variable already exists, not reinitializing");
        return;
      }
      
      gVar[projectId][nameGlobalVar] = initialValue;
      
      // Si es un array, creamos un vector de tiempo correspondiente
      if (Array.isArray(initialValue)) {
        // Creamos un vector de tiempo con la misma longitud que el array inicial
        const timeVector = [];
        const now = Date.now();
        for (let i = 0; i < initialValue.length; i++) {
          // Usamos timestamps ligeramente diferentes si el array ya tiene datos
          timeVector.push(now - (initialValue.length - i - 1) * 1000);
        }
        
        // Guardamos el vector de tiempo con un nombre relacionado a la variable original
        gVar[projectId][`${nameGlobalVar}_time`] = timeVector;
        
        console.log(`Created time vector for ${nameGlobalVar} with length ${timeVector.length}`);
        console.log(`Time vector keys after initialization:`, 
          Object.keys(gVar[projectId]).filter(key => key.endsWith('_time')));
      }
      
      console.log("Updated gVar:", Object.keys(gVar[projectId]));
    });
    /** EVENTOS DE SOCKET **/

    // New event: Handle polling boards request from backend_dash
    this.socket.on("request-polling-boards-b-b", async (pollingData, requestId) => {
      try {
        await generateBoardController(pollingData);
        this.socket.emit("response-polling-boards-b-b", { 
          success: true, 
          message: "Boards data polled successfully." 
        }, requestId);
      } catch (error) {
        console.error(`[POLLING BOARDS] Error:`, error);
        const errorMessage = error?.message || error?.toString() || "An error occurred while polling boards data.";
        console.error(`[POLLING BOARDS] Error message: ${errorMessage}`);
        this.socket.emit("response-polling-boards-b-b", { 
          success: false, 
          error: errorMessage
        }, requestId);
      }
    });

    // New event: Handle polling codes request from backend_dash
    this.socket.on("request-polling-codes-b-b", async (pollingDataCodes, requestId) => {
      console.log(`[POLLING CODES] Received request: ${requestId}`);
      try {
        await updateCodeBoardController(pollingDataCodes);
        console.log(`[POLLING CODES] Success for request: ${requestId}`);
        this.socket.emit("response-polling-codes-b-b", { 
          success: true, 
          message: "Codes data polled successfully." 
        }, requestId);
      } catch (error) {
        console.error(`[POLLING CODES] Error: ${error.message}`);
        this.socket.emit("response-polling-codes-b-b", { 
          success: false, 
          error: error.message || "An error occurred while polling codes data." 
        }, requestId);
      }
    });

    // New event: Handle status local request from backend_dash
    this.socket.on("request-status-local-b-b", (requestId) => {
      console.log(`[STATUS LOCAL] Received request: ${requestId}`);
      this.socket.emit("response-status-local-b-b", { 
        message: "localhost is online",
        online: true 
      }, requestId);
    });
  }

  // New helper method to ensure all arrays have proper time vectors
  ensureArrayTimeVectors(projectId) {
    if (!gVar[projectId]) return;
    
    // Find all array variables
    Object.keys(gVar[projectId]).forEach(key => {
      // Skip time vector keys themselves
      if (key.endsWith('_time')) return;
      
      const value = gVar[projectId][key];
      if (Array.isArray(value)) {
        const timeKey = `${key}_time`;
        
        // Create time vector if it doesn't exist
        if (!gVar[projectId][timeKey]) {
          const timeVector = [];
          const now = Date.now();
          
          // Create timestamps for each element
          for (let i = 0; i < value.length; i++) {
            timeVector.push(now - (value.length - i - 1) * 1000);
          }
          
          gVar[projectId][timeKey] = timeVector;
        } else if (gVar[projectId][timeKey].length !== value.length) {
          // Fix length mismatch between array and its time vector
          //console.log(`Fixing time vector length for ${key}: array=${value.length}, time=${gVar[projectId][timeKey].length}`);
          
          const timeVector = gVar[projectId][timeKey];
          const now = Date.now();
          
          // Add missing timestamps
          while (timeVector.length < value.length) {
            timeVector.push(now);
          }
          
          // Remove extra timestamps
          if (timeVector.length > value.length) {
            gVar[projectId][timeKey] = timeVector.slice(0, value.length);
          }
        }
      }
    });
  }
}

export default Sockets;
