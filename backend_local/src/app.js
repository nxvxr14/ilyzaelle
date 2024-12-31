import { boardSerial, boardWifi } from './controller.js';
import getBoardById from "./api.js";

let globalVar = {
    contador : 10,
    estado : false
}

// let boardCode = {
//     source : `
//     const board = boards[name]
//     const ledPin = 13;
//     board.pinMode(ledPin, board.MODES.OUTPUT);

//     setInterval(() => {
//         board.digitalWrite(ledPin, board.HIGH);

//         setTimeout(() => {
//             board.digitalWrite(ledPin, board.LOW);
//         }, 1000);
//     }, 2000);

//     setInterval(() => {
//         globalVar.contador++
//     }, 2000);
//     `,
//     version : `0.1`
// }

// const boards = [
//     {
//         boardType: 'PLC328P-SMD',
//         boardName: 'PLC02',
//         boardConnect: 2,
//         boardInfo: {
//             host: '192.168.1.6',
//             type: 'udp4',
//             port: 1025
//         },
//         modeLocal: false,
//     },
//     {
//         boardType: 'Arduino',
//         boardName: 'ardu01',
//         boardConnect: 1,
//         boardInfo: {
//             port: "/dev/ttyACM0"
//         },
//         modeLocal: false,
//     }
// ]

let boards = []

// de esta manera dejamos el await en api.js y podemos publicar la respuesta cuando la tengamos
getBoardById()
  .then((boards) => {

    boards.forEach(
      ({ boardType, boardName, boardConnect, boardInfo, boardCode }) => {
        boardConnect === 1 &&
          boardSerial(
            boardType,
            boardName,
            boardInfo.port,
            boardCode,
            globalVar
          );
        boardConnect === 2 &&
          boardWifi(
            boardType,
            boardName,
            boardInfo,
            boardCode,
            globalVar
          );
      }
    );
  })
  .catch((error) => {
    console.error("Error:", error);
  });
