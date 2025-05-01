import { SerialPort, firmata, EtherPort } from "./index.js";
import {
  gVar,
  updateCodeBoardController,
} from "../controllers/UpdateCodeBoardController.js";
import { clearTimersById } from "../controllers/ClearTimers.js";
// Import the new Xelorium library
import { xelInterval, xelTimeout } from "../utils/xeloriumLib.js";

export const boards = {};
export const virtualBridges = {};
export const tcpIpClient = {};

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
      if(closing){
        clearTimersById(_id);
        resolve();
        return;
      }
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
      if (boardConnect === 2 && boardType == 2) {
        console.log("cerrado USB virtual");
        virtualBridges[_id].close();
      }
      if (boardConnect === 2 && boardType == 3) {
        console.log("cerrado esp wifi");
        //tcpIpClient[_id].close();
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
    if (boardConnect === 2 && boardType == 2) {
      virtualBridges[_id] = new SerialPort(boardInfo);
      port = virtualBridges[_id];
    } else if (boardConnect === 2 && boardType == 3) {
      tcpIpClient[_id] = new EtherPort(Number(boardInfo.port));
      port = tcpIpClient[_id];
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

