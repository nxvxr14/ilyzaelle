import { boardSerial, boardWifi } from "../config/generate.js";

export const generateBoardController = async ({
  _id,
  boardType,
  boardName,
  boardConnect,
  boardInfo,
  active,
  closing
}) => {
  let globalVar = {
    contador: 10,
    estado: false,
  };

  boardConnect === 1 &&
    (await boardSerial(_id, boardType, boardName, boardInfo.port, active, closing));
  boardConnect === 2 &&
    (await boardWifi(_id, boardType, boardName, boardInfo, active, closing));
};
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

// boards.forEach(
//   ({ boardType, boardName, boardConnect, boardInfo, active, boardCode }) => {
//     boardConnect === 1 &&
//       active &&
//       boardSerial(boardType, boardName, boardInfo.port, boardCode, globalVar);
//     boardConnect === 2 &&
//       active &&
//       boardWifi(boardType, boardName, boardInfo, boardCode, globalVar);
//   }
// );
