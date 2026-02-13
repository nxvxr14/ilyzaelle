/** NORMAL **/
import { boards } from "../config/generate.js";
import { SerialPort, firmata } from "../config/index.js";
import { clearTimersById } from "./ClearTimers.js";
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

      // Inicializar gVar[project] si no existe
      if (!gVar[project]) {
        gVar[project] = {};
      }

      // Detectar inicializaciones de arrays para resetear sus time vectors.
      // Soporta ambos patrones: varG.variable = [] (nuevo) y gVar[project].variable = [] (legacy)
      const arrayInitRegex = /(?:varG|gVar\[project\])\.(\w+)\s*=\s*\[\]/g;
      let match;
      let arrayInits = [];

      while ((match = arrayInitRegex.exec(boardCode)) !== null) {
        const varName = match[1];
        if (!varName.endsWith("_time")) {
          arrayInits.push(varName);
        }
      }

      arrayInits.forEach((varName) => {
        const timeVectorName = `${varName}_time`;
        if (gVar[project].hasOwnProperty(timeVectorName)) {
          console.log(
            `Resetting time vector for ${varName}: ${timeVectorName}`
          );
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

      // Crear aliases locales para que el boardCode use sintaxis simplificada.
      // varG es una referencia directa a gVar[project] (no una copia).
      // board es una referencia directa a boards[_id].
      // eval() ejecuta en el scope léxico local, así que el boardCode verá estas variables.
      const varG = gVar[project];
      const board = boards[_id];

      // Crear versiones locales de setTimeout/setInterval que inyectan _id automáticamente.
      // ClearTimers.js extraerá el _id para trackear los timers.
      const setTimeout = (fn, delay, ...args) => global.setTimeout(fn, delay, ...args, _id);
      const setInterval = (fn, delay, ...args) => global.setInterval(fn, delay, ...args, _id);

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
