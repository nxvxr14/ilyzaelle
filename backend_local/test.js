import Firmata from "firmata";
import EtherPort from "etherport";

const PORT = 8080;  // Puerto que estás usando según tu log
const ANALOG_PIN = 4;  // A4 (GPIO32 en ESP32 DevKit V4)
const SAMPLING_INTERVAL_MS = 100;  // Reducir para mayor sensibilidad
const POLLING_INTERVAL_MS = 1000;  // Intervalo para solicitar activamente lecturas

console.log(`Intentando conectar al ESP32 en puerto ${PORT}...`);

// Crear una instancia de EtherPort en lugar de un servidor TCP
const transport = new EtherPort(PORT);
const board = new Firmata(transport);

let lastValue = null;

board.on("ready", () => {
    console.log("Firmata listo");

    // Set the sampling interval BEFORE configuring the pin
    console.log(`Estableciendo intervalo de muestreo a ${SAMPLING_INTERVAL_MS}ms`);
    board.setSamplingInterval(SAMPLING_INTERVAL_MS);

    console.log(`Configurando pin analógico A${ANALOG_PIN} (GPIO32)...`);
    board.pinMode(ANALOG_PIN, board.MODES.ANALOG);

    // Enable reporting for the pin
    console.log(`Habilitando reporte para pin analógico A${ANALOG_PIN}`);
    board.reportAnalogPin(ANALOG_PIN, 1); // 1 = enable

    console.log(`Escuchando eventos 'analog-read-${ANALOG_PIN}'...`);
    // Listen for the specific analog read event for this pin
    board.on(`analog-read-${ANALOG_PIN}`, (value) => {
        if (value !== lastValue) {  // Solo mostrar si hay cambio
            const voltage = (value * 3.3) / 4095;
            console.log(`Valor Analógico (A${ANALOG_PIN}/GPIO32): ${value} (${voltage.toFixed(2)}V)`);
            lastValue = value;
        }
    });

    // Implementar un sistema de polling periódico como respaldo
    const pollingInterval = setInterval(() => {
        // Re-habilitar el reporte periódicamente para asegurar que siga activo
        board.reportAnalogPin(ANALOG_PIN, 0); // Deshabilitar primero
        setTimeout(() => {
            board.reportAnalogPin(ANALOG_PIN, 1); // Habilitar nuevamente
            
            // Solicitar una lectura analógica explícita
            if (typeof board.analogRead === 'function') {
                board.analogRead(ANALOG_PIN, (value) => {
                    const voltage = (value * 3.3) / 4095;
                    console.log(`[Polling] Valor Analógico (A${ANALOG_PIN}/GPIO32): ${value} (${voltage.toFixed(2)}V)`);
                    lastValue = value;
                });
            }
        }, 50);  // Pequeño retraso entre deshabilitar y habilitar
    }, POLLING_INTERVAL_MS);

    // Función para limpiar los intervalos si se cierra la conexión
    const cleanup = () => {
        if (pollingInterval) clearInterval(pollingInterval);
    };

    transport.on("close", cleanup);
    transport.on("error", cleanup);
});

// Manejo de errores
transport.on("error", (err) => {
    console.error("Error en la conexión: ", err);
    if (board && typeof board.reset === 'function') {
        try {
            board.reportAnalogPin(ANALOG_PIN, 0); // 0 = disable
            board.reset();
            console.log("Board reset en error de conexión.");
        } catch (resetErr) {
            console.error("Error al resetear board en error de conexión:", resetErr);
        }
    }
});

transport.on("close", () => {
    console.log("Conexión cerrada");
    if (board && typeof board.reset === 'function') {
        try {
            console.log(`Deshabilitando reporte para pin analógico A${ANALOG_PIN}`);
            board.reportAnalogPin(ANALOG_PIN, 0); // 0 = disable
            board.reset();
            console.log("Board reset en cierre de conexión.");
        } catch (resetErr) {
            console.error("Error al resetear board en cierre de conexión:", resetErr);
        }
    }
});

// Mantener proceso vivo
process.on('SIGINT', () => {
    console.log('Cerrando aplicación...');
    if (board && typeof board.reset === 'function') {
        board.reportAnalogPin(ANALOG_PIN, 0);
        board.reset();
    }
    process.exit(0);
});