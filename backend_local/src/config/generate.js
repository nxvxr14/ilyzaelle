import { SerialPort, firmata } from "./index.js";
import {
  gVar,
  updateCodeBoardController,
} from "../controllers/UpdateCodeBoardController.js";
import { clearTimersById } from "../controllers/ClearTimers.js";
// Import the new Xelorium library
import { xelInterval, xelTimeout } from "../utils/xeloriumLib.js";

export const boards = {};
export const virtualBridges = {};
// Export the Xelorium functions to make them available to the eval code
export { xelInterval, xelTimeout };

export const connectBoard = ({ data }) => {
  const {
    _id,
    boardType,
    boardName,
    boardConnect,
    boardInfo,
    active,
    closing,
    project,
    boardCode,
  } = data;

  return new Promise((resolve, reject) => {
    // Special handling for boardType 4
    if (boardType === 4) {
      if (!gVar[project]) {
        gVar[project] = {};
      }
      updateCodeBoardController({ project, _id, boardCode });
      resolve();
      return;
    }
    
    // Original code for all other boardTypes
    // Función auxiliar para manejar el cierre de la placa
    const handleBoardClose = () => {
      console.log(`Closed! ${boardType}`);
      clearTimersById(_id);
      if (boardConnect === 1) {
        boards[_id].transport.close();
        console.log("cerrado USB");
      }
      // Si es una conexión WiFi, también necesitamos cerrar el puente virtual
      if (boardConnect === 2 && virtualBridges[_id]) {
        console.log("cerrado USB virtual");
        virtualBridges[_id].close();
      }
      boards[_id].isReady = false;
      console.log("isReady?" + boards[_id].isReady);
      resolve();
    };

    // Si está cerrando, manejamos el cierre y salimos
    if (closing) {
      handleBoardClose();
      return;
    }

    // Si no está activo, resolvemos inmediatamente
    // if (!active) {
    //   resolve();
    //   return;
    // }

    // Preparamos la conexión según el tipo
    let port;
    if (boardConnect === 2) {
      virtualBridges[_id] = new SerialPort(boardInfo);
      port = virtualBridges[_id];
    } else {
      port = boardInfo.port;
    }

    // Creamos la conexión con la placa
    boards[_id] = new firmata.Board(port, (error) => {
      if (error) {
        const errorMessage =
          boardConnect === 2
            ? `[${_id}] Error connecting to ${boardInfo.host}:${boardInfo.port} via WIFI: ${error}`
            : `[${_id}] Error connecting to ${boardInfo.port} via USB: ${error}`;
        reject(errorMessage);
        return;
      }

      const successMessage =
        boardConnect === 2
          ? `[${_id}] ${boardType} connected to ${boardInfo.host}:${boardInfo.port} via WIFI.`
          : `[${_id}] ${boardType} connected to ${boardInfo.port} via USB.`;
      console.log(successMessage);

      if (boards[_id].isReady) {
        // para evitar que cada actualizacion del boardcode reinicie el objeto y se rompa el backend
        if (!gVar[project]) {
          gVar[project] = {};
        }
        // mando project para tener la referencia de las variables globales del projecto unico, el _id para la referencia de la board y el boardcode unico de cada board, si no enviara project a ambas placas no podria leer gVar en ambas placas
        updateCodeBoardController({ project, _id, boardCode });
        resolve();
      }

      boards[_id].on("close", () => {
        console.log("onclose");
        boards[_id].transport.close();
        boards[_id].isReady = false;
      });
    });
  });
};

// refactrizado
// import { SerialPort, firmata } from "./index.js";
// import {
//   clearTimersById,
//   updateCodeBoardController,
// } from "../controllers/UpdateCodeBoardController.js";

// export const boards = {};
// export const virtualBridges = {};

// export const connectBoard = ({ data }) => {
//   const {
//     _id,
//     boardType,
//     boardName,
//     boardConnect,
//     boardInfo,
//     active,
//     closing,
//     project,
//     boardCode,
//     connectionType, // nuevo parámetro para distinguir el tipo de conexión
//   } = data;

//   return new Promise((resolve, reject) => {
//     // Función auxiliar para manejar el cierre de la placa
//     const handleBoardClose = () => {
//       console.log(`Closed! ${boardType}`);
//       clearTimersById(_id);
//       boards[_id].transport.close();
//       boards[_id].isReady = false;
//       console.log(boards[_id].isReady);
//       resolve();
//     };

//     // Si está cerrando, manejamos el cierre y salimos
//     if (closing) {
//       handleBoardClose();
//       return;
//     }

//     // Si no está activo, resolvemos inmediatamente
//     // if (!active) {
//     //   resolve();
//     //   return;
//     // }

//     // Preparamos la conexión según el tipo
//     let port;
//     if (boardConnect === 2) {
//       virtualBridges[_id] = new SerialPort(boardInfo);
//       port = virtualBridges[_id];
//     } else {
//       port = boardInfo.port;
//     }

//     // Creamos la conexión con la placa
//     boards[_id] = new firmata.Board(port, (error) => {
//       if (error) {
//         const errorMessage =
//           boardConnect === 2
//             ? `[${_id}] Error connecting to ${boardInfo.host}:${boardInfo.port} via WIFI: ${error}`
//             : `[${_id}] Error connecting to ${boardInfo.port} via USB: ${error}`;
//         reject(errorMessage);
//         return;
//       }

//       const successMessage =
//         boardConnect === 2
//           ? `[${_id}] ${boardType} connected to ${boardInfo.host}:${boardInfo.port} via WIFI.`
//           : `[${_id}] ${boardType} connected to ${boardInfo.port} via USB.`;
//       console.log(successMessage);

//       if (boards[_id].isReady) {
//         // mando project para tener la referencia de las variables globales del projecto unico, el _id para la referencia de la board y el boardcode unico de cada board, si no enviara project a ambas placas no podria leer gVar en ambas placas
//         updateCodeBoardController({ project, _id, boardCode });
//         resolve();
//       }

//       boards[_id].on("close", () => {
//         console.log("onclose")
//         boards[_id].transport.close();
//         boards[_id].isReady = false;
//         console.log(boards[_id].isReady + "casa");
//       });
//     });
//   });
// };

// refactrizado

// import { SerialPort, firmata } from "./index.js";
// import {
//   clearTimersById,
//   updateCodeBoardController,
// } from "../controllers/UpdateCodeBoardController.js";

// export const boards = {};
// export const virtualBridges = {};

// /*
// FALTA PONER LA FUNCION PARA CERRAR LA PLACA Y DETENER TODOS LOS PINES ANTES DE CERRAR LA CONEXION
// */

// export const boardSerial = ({ data }) => {
//   const {
//     _id,
//     boardType,
//     boardName,
//     boardInfo,
//     active,
//     closing,
//     project,
//     boardCode,
//   } = data;

//   console.log(data._id);
//   return new Promise((resolve, reject) => {
//     //reviso primero si desde la interfaz se ha puesto online o offline la board, si no es asi, resuelvo la promesa sin activar la board, si por el contrario, active es false significa que se quiere cerrar la placa, para hacer esto se usa closing y despus se resuelve
//     if (active)
//       boards[_id] = new firmata.Board(boardInfo.port, (error) => {
//         if (error) {
//           reject(
//             `[${_id}] Error connecting to ${boardInfo.port} via USB: ${error}`
//           );
//         } else {
//           console.log(
//             `[${_id}] ${boardType} connected to ${boardInfo.port} via USB.`
//           );
//         }
//         if (boards[_id].isReady) {
//           updateCodeBoardController({ project, _id, boardCode });
//           resolve();
//         }

//         boards[_id].on("close", () => {
//           boards[_id].transport.close();
//           boards[_id].isReady = false;
//           console.log(boards[_id].isReady);
//         });
//       });
//     // despues de un resolve no se ejecuta mas codigo, por eso se evalua antes active y despues closing por si active no esta on closing no tenga problemas en ejecutarse
//     if (!active) resolve();
//     if (closing) {
//       // si resuelvo la promesa antes y hay una funcion asincrona pendiente, no se ejecutara bien por eso el console log se ejecuta antes del board close y no despues
//       console.log("Closed! serial");
//       // **URGENTE** poner una promesa aca mas adelante para el clearTimersById
//       clearTimersById(_id);
//       boards[_id].transport.close();
//       boards[_id].on("close", () => {
//         // Unplug the board to see this event!
//         boards[_id].isReady = false;
//         console.log(boards[_id].isReady);
//       });
//       resolve();
//     }
//   });
// };

// export const boardWifi = ({ data }) => {
//   const {
//     _id,
//     boardType,
//     boardName,
//     boardInfo,
//     active,
//     closing,
//     project,
//     boardCode,
//   } = data;

//   return new Promise((resolve, reject) => {
//     virtualBridges[_id] = new SerialPort(boardInfo);
//     if (active)
//       boards[_id] = new firmata.Board(virtualBridges[_id], (err) => {
//         if (err) {
//           reject(
//             `[${_id}] Error connecting to ${boardInfo.host}:${boardInfo.port} via WIFI: ${err}`
//           );
//         } else {
//           console.log(
//             `[${_id}] ${boardType} connected to ${boardInfo.host}:${boardInfo.port} via WIFI.`
//           );

//           if (boards[_id].isReady) {
//             updateCodeBoardController({ project, _id, boardCode });
//             resolve();
//           }

//           boards[_id].on("close", () => {
//             boards[_id].transport.close();
//             boards[_id].isReady = false;
//             console.log(boards[_id].isReady);
//           });
//         }
//       });
//     if (closing) {
//       // si resuelvo la promesa antes y hay una funcion asincrona pendiente, no se ejecutara bien por eso el console log se ejecuta antes del board close y no despues
//       console.log("Closed! wifi");
//       // poner una promesa aca mas adelante
//       clearTimersById(_id);
//       boards[_id].transport.close();
//       boards[_id].isReady = false;
//       console.log(boards[_id].isReady);
//       boards[_id].on("close", () => {
//         console.log("dentro");
//       });
//       resolve();
//     }
//   });
// };

// /* INICIO CODIGO DE PRUEBA */
// board.pinMode(13, board.MODES.OUTPUT);
// board.digitalWrite(13, board.HIGH);
// console.log("LED encendido en el pin 13.");
// setTimeout(() => {
//   board.digitalWrite(13, board.HIGH);
// }, 5000);
// setTimeout(() => {
//   board.digitalWrite(13, board.LOW);
//   console.log("despues de 7 segundos");
// }, 7000);
// const prueba = () => {
//   console.log("prueba");
// }
// prueba()
// /* FIN CODIGO DE PRUEBA */
// // para cerrar manualmenet
// // board.transport.close();
// /* SI SE DESCONECTA LA BOARD */
// board.on("close", () => {
//   // Unplug the board to see this event!
//   console.log("Closed!");
// })
// resolve();
