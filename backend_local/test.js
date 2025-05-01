import Firmata from "firmata";
import net from "net";

const serverPort = 9090;

// Crear un servidor TCP que escuche en el puerto especificado
const server = net.createServer((socket) => {
    console.log("ESP32 conectado desde: " + socket.remoteAddress);
    
});
const board = new Firmata(socket);

board.on("ready", () => {
    console.log("Firmata listo");

    const pin = 13;
    let state = 1;

    board.pinMode(pin, board.MODES.OUTPUT);

    setInterval(() => {
      board.digitalWrite(pin, (state ^= 1));
    }, 3000);
  });