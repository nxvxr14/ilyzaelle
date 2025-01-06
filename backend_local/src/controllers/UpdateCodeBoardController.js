/** NORMAL **/
/*
import { boards } from "../config/generate.js";
import { SerialPort, firmata } from "../config/index.js";

export const updateCodeBoardController = ({ project, _id, boardCode }) => {
  return new Promise((resolve, reject) => {
      console.log(project, _id, boardCode);
      console.log("yes");
      eval(boardCode);
      resolve();
  }); // Added the missing closing parenthesis here
};
*/

/** SAFEEXCEUTION **/
// import { boards } from "../config/generate.js";
// import { SerialPort, firmata } from "../config/index.js";

// // Almacenará todos los IDs de los temporizadores
// const timerIds = {
//   timeouts: new Set(),
//   intervals: new Set(),
// };

// // Función para limpiar todos los temporizadores
// const clearAllTimers = () => {
//   // Limpiar todos los setTimeout
//   timerIds.timeouts.forEach((timer) => {
//     clearTimeout(timer);
//   });
//   timerIds.timeouts.clear();

//   // Limpiar todos los setInterval
//   timerIds.intervals.forEach((timer) => {
//     clearInterval(timer);
//   });
//   timerIds.intervals.clear();
// };

// // Guardar las funciones originales
// const originalSetTimeout = global.setTimeout;
// const originalSetInterval = global.setInterval;

// // Sobrescribir setTimeout
// global.setTimeout = (...args) => {
//   const timer = originalSetTimeout(...args);
//   timerIds.timeouts.add(timer);
//   return timer;
// };

// // Sobrescribir setInterval
// global.setInterval = (...args) => {
//   const timer = originalSetInterval(...args);
//   timerIds.intervals.add(timer);
//   return timer;
// };

// // Función auxiliar para crear un contexto seguro para eval
// const createSafeContext = (code) => {
//   const sandbox = {
//     setTimeout: global.setTimeout,
//     setInterval: global.setInterval,
//     clearTimeout: global.clearTimeout,
//     clearInterval: global.clearInterval,
//     console: console,
//     // Añade aquí otras variables o funciones que necesites exponer al código
//     boards,
//     SerialPort,
//     firmata,
//   };

//   return new Function(
//     "context",
//     `
//         with(context) {
//             ${code}
//         }
//     `
//   );
// };

// export const updateCodeBoardController = ({ project, _id, boardCode }) => {
//   return new Promise((resolve, reject) => {
//     try {
//       console.log(project, _id, boardCode);
//       console.log("yes");

//       // Limpiar todos los temporizadores existentes
//       clearAllTimers();

//       // Crear y ejecutar el código en un contexto más seguro
//       const safeExecution = createSafeContext(boardCode);
//       safeExecution({
//         setTimeout: global.setTimeout,
//         setInterval: global.setInterval,
//         clearTimeout: global.clearTimeout,
//         clearInterval: global.clearInterval,
//         console: console,
//         boards,
//         SerialPort,
//         firmata,
//         _id,
//       });

//       resolve();
//     } catch (error) {
//       console.error("Error en updateCodeBoardController:", error);
//       // Asegurarse de limpiar los temporizadores incluso si hay un error
//       clearAllTimers();
//       reject(error);
//     }
//   });
// };

// // Función para verificar temporizadores activos (útil para debugging)
// export const getActiveTimersCount = () => ({
//   timeouts: timerIds.timeouts.size,
//   intervals: timerIds.intervals.size,
// });

/** SAFEEXCEUTION **/


import { boards } from "../config/generate.js";
import { SerialPort, firmata } from "../config/index.js";

// Almacenará todos los IDs de los temporizadores por _id
const timerIds = new Map();

// Función para limpiar los temporizadores asociados a un _id específico
export const clearTimersById = (_id) => {
    if (!timerIds.has(_id)) return;

    const timers = timerIds.get(_id);

    timers.timeouts.forEach(timer => {
        clearTimeout(timer);
    });
    timers.timeouts.clear();

    timers.intervals.forEach(timer => {
        clearInterval(timer);
    });
    timers.intervals.clear();

    // Eliminar el _id de la lista una vez se han limpiado los temporizadores
    timerIds.delete(_id);
};

// Guardar las funciones originales
const originalSetTimeout = global.setTimeout;
const originalSetInterval = global.setInterval;

// Sobrescribir setTimeout
global.setTimeout = (...args) => {
    const _id = args[args.length - 1]._id; // Asumir que el último argumento tiene el _id
    if (!timerIds.has(_id)) {
        timerIds.set(_id, { timeouts: new Set(), intervals: new Set() });
    }
    const timer = originalSetTimeout(...args);
    timerIds.get(_id).timeouts.add(timer);
    return timer;
};

// Sobrescribir setInterval
global.setInterval = (...args) => {
    const _id = args[args.length - 1]._id; // Asumir que el último argumento tiene el _id
    if (!timerIds.has(_id)) {
        timerIds.set(_id, { timeouts: new Set(), intervals: new Set() });
    }
    const timer = originalSetInterval(...args);
    timerIds.get(_id).intervals.add(timer);
    return timer;
};

export const updateCodeBoardController = ({ project, _id, boardCode }) => {
    return new Promise((resolve, reject) => {
        try {
            console.log(project, _id, boardCode);
            console.log("yes");

            // Limpiar solo los temporizadores asociados a este _id antes de ejecutar nuevo código
            clearTimersById(_id);

            // Ejecutar el código directamente con eval
            eval(boardCode);

            resolve();
        } catch (error) {
            console.error('Error en updateCodeBoardController:', error);
            // Asegurarse de limpiar los temporizadores específicos de _id incluso si hay un error
            clearTimersById(_id);
            reject(error);
        }
    });
};

// Función para verificar temporizadores activos (útil para debugging)
export const getActiveTimersCount = (_id) => {
    if (!timerIds.has(_id)) return { timeouts: 0, intervals: 0 };
    
    const timers = timerIds.get(_id);
    return {
        timeouts: timers.timeouts.size,
        intervals: timers.intervals.size
    };
};
