/** NORMAL **/
import { boards } from "../config/generate.js";
import { SerialPort, firmata } from "../config/index.js";
import { clearTimersById } from "./ClearTimers.js";
import { xelInterval, xelTimeout } from "../utils/xelTIME.js";
import {
  setConnection,
  getAvailableVariables,
  getVariables,
  setVariable,
  killConection,
} from "../utils/xelHTTP.js";


import {
  connectMQTT,
  disconnectMQTT,
  clients,
  clearMQTTListeners,
} from "../utils/xelMQTT.js";

export let gVar = {};

export const updateCodeBoardController = ({ project, _id, boardCode }) => {
  return new Promise((resolve, reject) => {
    try {
      // Limpiar solo los temporizadores asociados a este _id antes de ejecutar nuevo código
      clearTimersById(_id);

      // Check for array initializations and ensure time vectors are also reset
      const arrayInitRegex = /gVar\[project\]\.(\w+)\s*=\s*\[\]/g;
      let match;
      let arrayInits = [];

      // Find all array initializations in the code
      while ((match = arrayInitRegex.exec(boardCode)) !== null) {
        const varName = match[1];
        if (!varName.endsWith("_time")) {
          // Only process data arrays, not time vectors
          arrayInits.push(varName);
        }
      }

      // For each array initialization, check and reset its time vector if it exists
      arrayInits.forEach((varName) => {
        const timeVectorName = `${varName}_time`;
        // Check if the time vector exists
        if (gVar[project] && gVar[project].hasOwnProperty(timeVectorName)) {
          console.log(
            `Resetting time vector for ${varName}: ${timeVectorName}`
          );
          // Reset the time vector to an empty array
          gVar[project][timeVectorName] = [];
        }
      });

      if (boards[_id]) {
        // eliminar los listeners antes
        for (let i = 0; i < boards[_id].pins.length; i++) {
          // Construye el nombre del evento para la lectura digital de este pin
          const eventName = `digital-read-${i}`;
          // Remueve todos los listeners para ESE evento específico
          boards[_id].removeAllListeners(eventName);

          // Opcional: Para detener el reporte desde el Arduino (más eficiente)
          // Verifica si el pin está en modo INPUT o PULLUP antes de intentar apagar el reporte
          // if (boards[_id].pins[i] && (boards[_id].pins[i].mode === boards[_id].MODES.INPUT || boards[_id].pins[i].mode === boards[_id].MODES.PULLUP)) {
          //   boards[_id].reportDigitalPin(i, 0); // 0 para detener el reporte
          // }
        }
        console.log(`[GenerateBoardController] Listeners digitales removidos para board ${_id}.`);

        for (let i = 0; i < boards[_id].analogPins.length; i++) {
          // El nombre del evento análogo usa el índice del canal (0, 1, 2...)
          const eventName = `analog-read-${i}`;
          // Remueve todos los listeners para ESE evento específico
          boards[_id].removeAllListeners(eventName);

          // Opcional: Para detener el reporte desde el Arduino (más eficiente)
          // boards[_id].reportAnalogPin(i, 0); // 0 para detener el reporte, usa el índice del canal análogo
        }
      }

      if (clients[_id]) {
        clearMQTTListeners(_id);
      }
      eval(boardCode);
      resolve();
    } catch (error) {
      console.error("Error en updateCodeBoardController:", error);
      // Asegurarse de limpiar los temporizadores específicos de _id incluso si hay un error
      clearTimersById(_id);
      reject(error);
    }
  });
};
