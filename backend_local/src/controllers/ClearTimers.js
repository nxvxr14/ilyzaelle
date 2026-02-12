// Almacenará todos los IDs de los temporizadores por _id
const timerIds = new Map();

// Función para limpiar los temporizadores asociados a un _id específico
export const clearTimersById = (_id) => {
  if (!timerIds.has(_id)) return;
  const timers = timerIds.get(_id);

  timers.timeouts.forEach((timer) => {
    clearTimeout(timer);
  });
  timers.timeouts.clear();

  timers.intervals.forEach((timer) => {
    clearInterval(timer);
  });
  timers.intervals.clear();

  // Eliminar el _id de la lista una vez se han limpiado los temporizadores
  timerIds.delete(_id);
};

// Guardar las funciones originale
const originalSetTimeout = global.setTimeout;
const originalSetInterval = global.setInterval;

// Sobrescribir setTimeout
global.setTimeout = (...args) => {
  const _id = args.length > 2 ? args[args.length - 1] : null;
  const cleanArgs = _id ? args.slice(0, -1) : args;

  if (_id) {
    if (!timerIds.has(_id)) {
      timerIds.set(_id, { timeouts: new Set(), intervals: new Set() });
    }
  }

  const timer = originalSetTimeout(...cleanArgs);

  if (_id) {
    timerIds.get(_id).timeouts.add(timer);
  }

  return timer;
};

// Sobrescribir setInterval
global.setInterval = (...args) => {
  const _id = args.length > 2 ? args[args.length - 1] : null;
  const cleanArgs = _id ? args.slice(0, -1) : args;

  if (_id) {
    if (!timerIds.has(_id)) {
      timerIds.set(_id, { timeouts: new Set(), intervals: new Set() });
    }
  }

  const timer = originalSetInterval(...cleanArgs);

  if (_id) {
    timerIds.get(_id).intervals.add(timer);
  }

  return timer;
};