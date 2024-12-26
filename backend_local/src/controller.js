import { sendBoardtoApp, sendBoardtoApp1 } from '../manualCoding.js';
import { SerialPort, firmata } from './config.js';

const boards = {}
const virtualBridges = {}

export const boardSerial = (type, name, port, model, code, globalVar) => {
    boards[name] = new firmata.Board(port, () => {
        console.log(`[${name}] ${type} connected to ${port} via USB.`);
        model ? eval(code) : sendBoardtoApp(globalVar, boards[name])
    });
}

export const boardWifi = (type, name, boardInfo, model, code, globalVar) => {
    virtualBridges[name] = new SerialPort(boardInfo);

    boards[name] = new firmata.Board(virtualBridges[name], () => {
        console.log(`[${name}] ${type} connected to ${boardInfo.host}:${boardInfo.port} via WIFI.`);
        model ? eval(code) : sendBoardtoApp1(globalVar, boards[name])
    });
}