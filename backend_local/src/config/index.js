import { SerialPort } from 'udp-serial';  // Importar desde 'udp-serial'
import firmata from 'firmata';              // Importar firmata
// import johnnyFive from "johnny-five";
// const { Board, Led } = johnnyFive;

// Alguna funcionalidad que desees exportar
export { 
    SerialPort, firmata, 
    // Board, Led 
 };  // Exporta las importaciones para que otros archivos las usen
