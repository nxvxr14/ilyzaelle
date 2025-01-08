import { SerialPort, firmata } from "./index.js";
import {
  clearTimersById,
  updateCodeBoardController,
} from "../controllers/UpdateCodeBoardController.js";

export const boards = {};
export const virtualBridges = {};

/*
FALTA PONER LA FUNCION PARA CERRAR LA PLACA Y DETENER TODOS LOS PINES ANTES DE CERRAR LA CONEXION
*/

export const boardSerial = (
  _id,
  type,
  name,
  port,
  active,
  closing,
  project,
  boardCode
) => {
  return new Promise((resolve, reject) => {
    //reviso primero si desde la interfaz se ha puesto online o offline la board, si no es asi, resuelvo la promesa sin activar la board, si por el contrario, active es false significa que se quiere cerrar la placa, para hacer esto se usa closing y despus se resuelve
    if (active)
      boards[_id] = new firmata.Board(port, (error) => {
        if (error) {
          reject(`[${_id}] Error connecting to ${port} via USB: ${error}`);
        } else {
          console.log(`[${_id}] ${type} connected to ${port} via USB.`);
        }
        if (boards[_id].isReady) {
          updateCodeBoardController({ project, _id, boardCode });
          resolve();
        }

        boards[_id].on("close", () => {
          boards[_id].transport.close();
          boards[_id].isReady = false;
          console.log(boards[_id].isReady);
        });
      });
    // despues de un resolve no se ejecuta mas codigo, por eso se evalua antes active y despues closing por si active no esta on closing no tenga problemas en ejecutarse
    if (!active) resolve();
    if (closing) {
      // si resuelvo la promesa antes y hay una funcion asincrona pendiente, no se ejecutara bien por eso el console log se ejecuta antes del board close y no despues
      console.log("Closed!");
      // **URGENTE** poner una promesa aca mas adelante para el clearTimersById
      clearTimersById(_id);
      boards[_id].transport.close();
      boards[_id].on("close", () => {
        // Unplug the board to see this event!
        boards[_id].isReady = false;
        console.log(boards[_id].isReady);
      });
      resolve();
    }
  });
};

export const boardWifi = (
  _id,
  type,
  name,
  boardInfo,
  active,
  closing,
  project,
  boardCode
) => {
  return new Promise((resolve, reject) => {
    virtualBridges[_id] = new SerialPort(boardInfo);
    if (active)
      boards[_id] = new firmata.Board(virtualBridges[_id], (err) => {
        if (err) {
          reject(
            `[${_id}] Error connecting to ${boardInfo.host}:${boardInfo.port} via WIFI: ${err}`
          );
        } else {
          console.log(
            `[${_id}] ${type} connected to ${boardInfo.host}:${boardInfo.port} via WIFI.`
          );

          if (boards[_id].isReady) {
            updateCodeBoardController({ project, _id, boardCode });
            resolve();
          }
        }
      });
    if (closing) {
      // si resuelvo la promesa antes y hay una funcion asincrona pendiente, no se ejecutara bien por eso el console log se ejecuta antes del board close y no despues
      console.log("Closed!");
      // poner una promesa aca mas adelante
      clearTimersById(_id);
      // boards[_id].transport.close();
      // boards[_id].isReady = false;
      // console.log(boards[_id].isReady);
      // boards[_id].on("close", () => {});
      resolve();
    }
  });
};

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
