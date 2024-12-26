import { boardSerial, boardWifi } from './controller.js';

let globalVar = {
    contador : 10, 
    estado : false
}

let boardCode = {
    source : `
    const board = boards[name]
    const ledPin = 13; 
    board.pinMode(ledPin, board.MODES.OUTPUT);

    setInterval(() => {
        board.digitalWrite(ledPin, board.HIGH); 

        setTimeout(() => {
            board.digitalWrite(ledPin, board.LOW); 
        }, 1000); 
    }, 2000); 

    setInterval(() => {
        globalVar.contador++
    }, 2000);
    `,
    version : `0.1`
}

const boards = [
    {
        boardType: 'PLC328P-SMD',
        boardName: 'PLC02',
        boardConnect: 2,
        boardInfo: {
            host: '192.168.1.6',
            type: 'udp4',
            port: 1025
        },
        modeLocal: false,
    },
    {
        boardType: 'Arduino',
        boardName: 'ardu01',
        boardConnect: 1,
        boardInfo: {
            port: "/dev/ttyACM0"
        },
        modeLocal: false,
    }
]

boards.forEach(({
    boardType,
    boardName,
    boardConnect,
    boardInfo,
    modeLocal,
}) => {
    boardConnect === 1 && boardSerial(boardType, boardName, boardInfo.port, modeLocal, boardCode.source, globalVar) 
    boardConnect === 2 && boardWifi(boardType, boardName, boardInfo, modeLocal, boardCode.source, globalVar) 
});



