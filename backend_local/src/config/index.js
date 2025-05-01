import { SerialPort } from 'udp-serial';  // Importar desde 'udp-serial'
import firmata from 'firmata';              // Importar firmata
import net from 'net';                    // Importar net
import EtherPort from 'etherport';

// import johnnyFive from "johnny-five";
// const { Board, Led } = johnnyFive;

// Alguna funcionalidad que desees exportar
export { 
    SerialPort, firmata, net, EtherPort
    // Board, Led 
 };  // Exporta las importaciones para que otros archivos las usen
