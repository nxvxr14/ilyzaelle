import { SerialPort, firmata } from "./index.js";
const boards = {};
const virtualBridges = {};

export const boardSerial = (_id, type, name, port, active, closing) => {
  return new Promise((resolve, reject) => {
    //reviso primero si desde la interfaz se ha puesto online o offline la board, si no es asi, resuelvo la promesa sin activar la board, si por el contrario, active es false significa que se quiere cerrar la placa, para hacer esto se usa closing y despus se resuelve
    if (active) boards[_id] = new firmata.Board(port, (error) => {
      const board = boards[_id];
      if (error) {
        reject(`[${_id}] Error connecting to ${port} via USB: ${error}`);
      } else {
        console.log(`[${_id}] ${type} connected to ${port} via USB.`);
        
        /* INICIO CODIGO DE PRUEBA */
        board.pinMode(13, board.MODES.OUTPUT);
        board.digitalWrite(13, board.HIGH);
        console.log("LED encendido en el pin 13.");
        setTimeout(() => {
          board.digitalWrite(13, board.HIGH);
        }, 5000);
        setTimeout(() => {
          board.digitalWrite(13, board.LOW);
          console.log("despues de 7 segundos");
        }, 7000);
        const prueba = () => {
          console.log("prueba");
        }
        prueba()
        /* FIN CODIGO DE PRUEBA */
        // para cerrar manualmenet
        // board.transport.close();
        /* SI SE DESCONECTA LA BOARD */
        board.on("close", () => {
          // Unplug the board to see this event!
          console.log("Closed!");
        })
        resolve();
      }
    });
    // despues de un resolve no se ejecuta mas codigo, por eso se evalua antes active y despues closing por si active no esta on closing no tenga problemas en ejecutarse
    if(!active) resolve()
    if(closing) {
      // si resuelvo la promesa antes y hay una funcion asincrona pendiente, no se ejecutara bien por eso el console log se ejecuta antes del board close y no despues 
      console.log("Closed!");
      boards[_id].transport.close(); 
      boards[_id].on("close", () => {
        // Unplug the board to see this event!
      })
      resolve()
    }
  });
};

export const boardWifi = (_id, type, name, boardInfo, active, closing) => {
  return new Promise((resolve, reject) => {
    virtualBridges[_id] = new SerialPort(boardInfo);
    if (active) boards[_id] = new firmata.Board(virtualBridges[_id], (err) => {
      if (err) {
        reject(
          `[${_id}] Error connecting to ${boardInfo.host}:${boardInfo.port} via WIFI: ${err}`
        );
      } else {
        console.log(
          `[${_id}] ${type} connected to ${boardInfo.host}:${boardInfo.port} via WIFI.`
        );
        resolve(); // Resolvemos la promesa cuando la conexión se establece
      }
    });
    if(!active) resolve()
    if(closing) {
      // si resuelvo la promesa antes y hay una funcion asincrona pendiente, no se ejecutara bien por eso el console log se ejecuta antes del board close y no despues 
      console.log("Closed!");
      boards[_id].transport.close(); 
      boards[_id].on("close", () => {
        // Unplug the board to see this event!
      })
      resolve()
    }
  });
};
