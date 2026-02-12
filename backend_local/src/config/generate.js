import { SerialPort, firmata, EtherPort, net } from "./index.js";
import {
  gVar,
  updateCodeBoardController,
} from "../controllers/UpdateCodeBoardController.js";
import { clearTimersById } from "../controllers/ClearTimers.js";
// Import the ESP32 functions including the new disconnect function
import {
  setConnection,
  getAvailableVariables,
  getVariables,
  setVariable,
  killConection,
} from "../utils/xelHTTP.js";

import { connectMQTT, disconnectMQTT, clients } from "../utils/xelMQTT.js";


export const boards = {};
export const virtualBridges = {};
export const tcpIpClient = {};
export const activeSockets = {};
export const mqttConnections= {};

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
    // Special handling for HTTP client
    if (boardType === 4) {
      if (closing) {
        // Clean up ESP32 connection before clearing timers
        killConection({ project, _id });
        clearTimersById(_id);
        resolve();
        return;
      }

      if (!gVar[project]) {
        gVar[project] = {};
      }

      // Connect to your ESP32 device
      setConnection({
        project: project,
        _id: _id,
        ip: boardInfo.port, // Use your ESP32's actual IP address
        serverAPIKey: boardInfo.host // The API key you set in your ESP32 code
      });

      updateCodeBoardController({ project, _id, boardCode });
      resolve();
      return;
    }

    if (boardType === 5) {
      if (closing) {
        // Clean up MQTT connection before clearing timers
        disconnectMQTT({ _id });
        clearTimersById(_id);
        resolve();
        return;
      }

      if (!gVar[project]) {
        gVar[project] = {};
      }

      // Connect to your MQTT broker
      connectMQTT({
        project: project,
        _id: _id,
        brokerUrl: boardInfo.host, // Use your MQTT broker's actual URL
        port: boardInfo.port, // The port for your MQTT broker
      });

      updateCodeBoardController({ project, _id, boardCode });
      resolve();
      return;
    }

    // Original code for all other boardTypes
    // Función auxiliar para manejar el cierre de la placa
    const handleBoardClose = () => {
      console.log(`[GenerateBoardController] Closed! ${boardType}`);
      clearTimersById(_id);
      if (boardConnect === 1) {
        boards[_id].transport.close();
        console.log("[GenerateBoardController] cerrado USB");
      }
      // Si es una conexión WiFi, también necesitamos cerrar el puente virtual
      if (boardConnect === 2 && boardType == 2) {
        console.log("[GenerateBoardController] cerrado USB virtual");
        virtualBridges[_id].close();
      }
      if (boardConnect === 2 && boardType == 3) {
        console.log("[GenerateBoardController] cerrado esp wifi");
        console.log(`[GenerateBoardController] Closing active socket for ${_id}`);
        activeSockets[_id].end(); // Gracefully end the connection
        activeSockets[_id].destroy();
        delete activeSockets[_id];
        tcpIpClient[_id].close(() => {
          console.log(`[GenerateBoardController] TCP server on port ${boardInfo.port} closed`);
        });
        delete tcpIpClient[_id];
        //tcpIpClient[_id].close();
      }
      boards[_id].isReady = false;
      console.log("[GenerateBoardController] isReady?" + boards[_id].isReady);
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
      createFirmataBoard(port);
    } else if (boardConnect === 2 && boardType == 3) {
      // tcpIpClient[_id] = new EtherPort(Number(boardInfo.port));
      //port = tcpIpClient[_id];

      // Iniciar el servidor
      tcpIpClient[_id] = net.createServer((socket) => {
        activeSockets[_id] = socket;

        // Add error handling for the socket
        socket.on("error", (err) => {
          console.error(`Socket error for board ${_id}:`, err.message);
          // Don't let this crash the application
        });

        // Handle socket disconnection
        socket.on("close", () => {
          console.log(`Client disconnected from port ${boardInfo.port}`);
          delete activeSockets[_id];
        });

        createFirmataBoard(socket);
      });

      // Add error handling for the TCP server
      tcpIpClient[_id].on("error", (err) => {
        console.error(
          `TCP server error on port ${boardInfo.port}:`,
          err.message
        );
        // If the port is in use, you might want to handle that specifically
        if (err.code === "EADDRINUSE") {
          console.error(`Port ${boardInfo.port} is already in use`);
        }
        reject(err.message);
      });
      tcpIpClient[_id].listen(boardInfo.port, () => {
        console.log(`Servidor escuchando en el puerto ${boardInfo.port}`);
      });
    } else {
      port = boardInfo.port;
      createFirmataBoard(port);
    }

    // Creamos la conexión con la placa
    // Move board creation to a function that can be called at the right time
    function createFirmataBoard(connectionPort) {
      boards[_id] = new firmata.Board(connectionPort, (error) => {
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
          console.log("[GenerateBoardController] onclose");
          if (!boardConnect === 2 && !boardType == 3)
            boards[_id].transport.close();
          boards[_id].isReady = false;
        });
      });

      // Add error event handler
      boards[_id].on("error", (error) => {
        console.error(`[${_id}] Board connection error:`, error.message);

        // Clean up resources
        if (boards[_id] && boards[_id].isReady) {
          clearTimersById(_id);
          boards[_id].isReady = false;

          // Handle socket/connection cleanup based on connection type
          if (boardConnect === 2 && boardType == 3 && activeSockets[_id]) {
            console.log(`Cleaning up socket for ${_id} after error`);
            activeSockets[_id].removeAllListeners();
            delete activeSockets[_id];
          }
        }

        // Optional: implement reconnection logic here if needed
      });
    }
  });
};
