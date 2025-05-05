import mqtt from 'mqtt';
import { gVar } from '../controllers/UpdateCodeBoardController.js';

// Almacena las conexiones a clientes MQTT usando un único objeto
export const clients = {}

/**
 * Crea una conexión MQTT
 * @param {Object} config - Configuración de la conexión
 * @param {string} config.project - ID del proyecto
 * @param {string} config._id - ID único de la conexión
 * @param {string} config.brokerUrl - URL del broker MQTT (ej: mqtt://191.104.235.60)
 * @param {number} config.port - Puerto del broker (por defecto: 1883)
 * @param {Object} config.options - Opciones adicionales de conexión MQTT
 * @returns {Promise} - Promesa que se resuelve cuando la conexión es exitosa
 */
export const connectMQTT = ({ project, _id, brokerUrl, port , options = {} }) => {
  return new Promise((resolve, reject) => {
    try {
      // Inicializar el espacio de variables para este proyecto si no existe
      if (!gVar[project]) {
        gVar[project] = {};
      }

      // Opciones por defecto
      const clientOptions = {
        port,
        clientId: `xel_${_id}_${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        ...options
      };

      console.log(`🔄 Conectando a ${brokerUrl} para el dispositivo ${_id}...`);

      // Crear el cliente MQTT
      clients[_id] = mqtt.connect(brokerUrl, clientOptions);
      clients[_id].brokerUrl = brokerUrl;
      clients[_id].project = project;
      clients[_id].topics = new Set();
      clients[_id].connected = false;

      // Evento: conexión exitosa
      clients[_id].on('connect', () => {
        console.log(`✅ Conexión MQTT establecida para ${_id}`);
        clients[_id].connected = true;
        resolve(true);
      });

      // Evento: error
      clients[_id].on('error', (err) => {
        console.error(`❌ Error de conexión MQTT para ${_id}:`, err.message);
        clients[_id].end();
        reject(err);
      });

      // Evento: reconexión
      clients[_id].on('reconnect', () => {
        console.log(`🔄 Reconectando MQTT para ${_id}...`);
      });

      // Evento: desconexión
      clients[_id].on('close', () => {
        console.log(`🔌 Conexión MQTT cerrada para ${_id}`);
         // Verificar si el cliente todavía existe antes de modificar sus propiedades
         if (clients[_id]) {
            clients[_id].connected = false;
          }      });

      // Timeout de conexión
      setTimeout(() => {
        if (clients[_id] && !clients[_id].connected) {
          console.error(`⏱️ Timeout de conexión MQTT para ${_id}`);
          clients[_id].end(true);
          reject(new Error('Timeout de conexión MQTT'));
        }
      }, 10000); // 10 segundos de timeout

    } catch (error) {
      console.error(`❌ Error al configurar MQTT para ${_id}:`, error.message);
      reject(error);
    }
  });
};

/**
 * Desconecta un cliente MQTT
 * @param {Object} params - Parámetros
 * @param {string} params._id - ID de la conexión a desconectar
 * @returns {boolean} - true si se desconectó correctamente, false si no existía
 */
export const disconnectMQTT = ({ _id }) => {
  try {
    if (clients[_id]) {
      console.log(`🔌 Desconectando MQTT para ${_id}...`);
      clients[_id].end(true);
      delete clients[_id];
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error al desconectar MQTT para ${_id}:`, error.message);
    return false;
  }
};

/**
 * Verifica si existe una conexión MQTT
 * @param {string} _id - ID de la conexión
 * @returns {boolean} - true si existe y está conectada
 */
export const isMQTTConnected = (_id) => {
  return !!(clients[_id] && clients[_id].connected);
};

/**
 * Obtiene la lista de conexiones MQTT activas
 * @returns {Object} - Lista de conexiones activas
 */
export const getActiveMQTTConnections = () => {
  const connections = {};
  
  Object.keys(clients).forEach(id => {
    connections[id] = {
      brokerUrl: clients[id].brokerUrl,
      connected: clients[id].connected,
      topics: Array.from(clients[id].topics)
    };
  });
  
  return connections;
};


/**
 * Limpia todas las suscripciones y listeners para un cliente específico
 * @param {string} _id - ID de la conexión
 * @returns {boolean} - true si se limpiaron correctamente, false si no existía el cliente
 */
export const clearMQTTListeners = (_id) => {
    try {
      if (clients[_id]) {
        console.log(`🧹 Limpiando listeners MQTT para ${_id}...`);
        
        // Guardar la lista de tópicos a los que estaba suscrito
        const topics = Array.from(clients[_id].topics);
        
        // Cancelar todas las suscripciones actuales
        if (topics.length > 0) {
          clients[_id].unsubscribe(topics);
          clients[_id].topics.clear();
          console.log(`🔄 Canceladas ${topics.length} suscripciones para ${_id}`);
        }
        
        // Eliminar todos los listeners de mensajes
        clients[_id].removeAllListeners('message');
        console.log(`🔄 Eliminados todos los listeners de mensajes para ${_id}`);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Error limpiando listeners MQTT: ${error.message}`);
      return false;
    }
  };

export default {
  connectMQTT,
  disconnectMQTT,
  isMQTTConnected,
  getActiveMQTTConnections,
  clearMQTTListeners,
  clients
};