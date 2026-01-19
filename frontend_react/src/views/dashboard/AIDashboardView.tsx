import { getProjectById } from "@/api/ProjectApi";
import { updateAIDash } from "@/api/ProjectApi";
import { SocketContext } from "@/context/SocketContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

const CUKI_IA_API = import.meta.env.VITE_CUKI_IA_API;

const AIDashboardView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const projectId = params.projectId!;

  const { socket, setServerAPI } = useContext(SocketContext);
  const [gVarData, setGVarData] = useState<Record<string, unknown>>(null as unknown as Record<string, unknown>);
  const [serverAPIKey, setServerAPIKeyLocal] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
  });

  const updateAIDashMutation = useMutation({
    mutationFn: updateAIDash,
    onSuccess: () => {
      navigate(`/projects/${projectId}/dashboard`);
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  useEffect(() => {
    if (data) {
      setServerAPI(data.serverAPIKey);
      setServerAPIKeyLocal(data.serverAPIKey);
    }
  }, [data, setServerAPI]);

  useEffect(() => {
    if (socket && serverAPIKey) {
      const handleUpdateGVar = (gVarData: Record<string, unknown>, responseServerAPIKey: string) => {
        if (responseServerAPIKey === serverAPIKey) {
          setGVarData(gVarData);
        }
      };

      socket.on('response-gVar-update-b-f', handleUpdateGVar);

      const intervalId = setInterval(() => {
        socket.emit('request-gVar-update-f-b', projectId, serverAPIKey);
      }, 500);

      return () => {
        clearInterval(intervalId);
        socket.off('response-gVar-update-b-f', handleUpdateGVar);
      };
    }
    
    return () => {};
  }, [socket, projectId, serverAPIKey]);

  const extractHtmlFromResponse = (response: string): string | null => {
    const startMarker = "---INICIOHTML---";
    const endMarker = "---FINHTML---";
    
    const startIndex = response.indexOf(startMarker);
    const endIndex = response.indexOf(endMarker);
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      return response.substring(startIndex + startMarker.length, endIndex).trim();
    }
    return null;
  };

  const handleGenerateAI = async () => {
    if (!prompt.trim()) {
      setError("Por favor, ingresa un prompt para generar el dashboard.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setAiResponse("");

const systemPrompt = `Eres un generador de dashboards HTML interactivos. Debes crear una página HTML completa (CSS + JS + HTML en un solo archivo) siguiendo estas instrucciones:

FORMATO DE RESPUESTA:
- Devuelve el código dentro de los delimitadores: ---INICIOHTML--- [tu código aquí] ---FINHTML---
- Todo en un solo archivo .html (no generes archivos separados)
- Usa estilos CSS mínimos para ahorrar tokens

REQUISITOS TÉCNICOS:
- Incluir Socket.IO: <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
- La conexión SIEMPRE se debe realizar por Socket.IO usando el código base proporcionado
- Configuración fija: socketUrl = 'https://undercromo.dev'
- updateInterval recomendado: 500ms

VARIABLES GLOBALES (gVar):
- Tipos disponibles: number, boolean, array
- Las variables del servidor se acceden mediante readVariable(name) o readAllVariables()
- Cuando el usuario mencione "manipular una variable", se refiere a las gVar del servidor Socket

OPERACIONES CRUD DISPONIBLES:
- createVariable(name, value) → Crear nueva variable en el servidor
- readVariable(name) → Leer una variable específica
- readAllVariables() → Leer todas las variables (sin las que terminan en _time)
- updateVariable(name, newValue) → Actualizar valor de variable existente
- deleteVariable(name) → Eliminar/reiniciar variable del servidor

CÓDIGO BASE OBLIGATORIO:
Siempre incluye este código de inicialización (reemplaza TU_API_KEY y TU_PROJECT_ID con los valores CONFIG):

const CONFIG = {
    serverAPIKey: 'SERVER_API_KEY_PLACEHOLDER',
    projectId: 'PROJECT_ID_PLACEHOLDER',
    socketUrl: 'https://undercromo.dev',
    updateInterval: 500
};

let socket = null;
let gVarData = {};
let updateIntervalId = null;
let isConnected = false;

function initSocket() {
    socket = io(CONFIG.socketUrl, { transports: ['websocket', 'polling'] });
    
    socket.on('connect', () => {
        isConnected = true;
        socket.emit('join-server', CONFIG.serverAPIKey);
        startDataPolling();
    });
    
    socket.on('disconnect', () => { isConnected = false; stopDataPolling(); });
    
    socket.on('response-gVar-update-b-f', (data, key) => {
        if (key === CONFIG.serverAPIKey) { gVarData = data; onDataReceived(gVarData); }
    });
}

function startDataPolling() {
    requestGVarUpdate();
    updateIntervalId = setInterval(() => isConnected && requestGVarUpdate(), CONFIG.updateInterval);
}

function stopDataPolling() { clearInterval(updateIntervalId); }

function requestGVarUpdate() {
    socket.emit('request-gVar-update-f-b', CONFIG.projectId, CONFIG.serverAPIKey);
}

function createVariable(name, value) {
    socket.emit('request-gVarriable-initialize-f-b', CONFIG.projectId, name, value, CONFIG.serverAPIKey);
}

function updateVariable(name, newValue) {
    socket.emit('request-gVariable-change-f-b', name, newValue, CONFIG.projectId, CONFIG.serverAPIKey);
}

function deleteVariable(name) {
    socket.emit('request-gVariable-delete-f-b', CONFIG.projectId, name, CONFIG.serverAPIKey);
}

function readVariable(name) { return gVarData[name]; }

function readAllVariables() {
    return Object.fromEntries(Object.entries(gVarData).filter(([k]) => !k.endsWith('_time')));
}

function onDataReceived(data) {
    // IMPLEMENTA AQUÍ LA ACTUALIZACIÓN DE TU DASHBOARD
}

document.addEventListener('DOMContentLoaded', initSocket);

INSTRUCCIONES IMPORTANTES:
- Implementa la lógica de UI dentro de onDataReceived(data)
- Usa readVariable() para obtener valores específicos
- Los placeholders SERVER_API_KEY_PLACEHOLDER y PROJECT_ID_PLACEHOLDER serán reemplazados automáticamente
- Minimiza el CSS pero mantén la funcionalidad y legibilidad
- Crea dashboards responsive y modernos`;
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    try {
      const response = await fetch(CUKI_IA_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: fullPrompt }]
        }),
      });

      if (!response.ok) {
        throw new Error('Error al comunicarse con la API de IA');
      }

      // Leer el stream de texto
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No se pudo obtener el lector del stream');
      }

      const decoder = new TextDecoder();
      let fullText = '';

      // Leer todos los chunks del stream usando funcion recursiva
      const readStream = async (): Promise<string> => {
        const { done, value } = await reader.read();
        if (done) return fullText;
        
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setAiResponse(fullText); // Actualizar en tiempo real
        return readStream();
      };

      await readStream();

      const extractedHtml = extractHtmlFromResponse(fullText);
      
      if (extractedHtml) {
        updateAIDashMutation.mutate({
          projectId,
          AIDash: extractedHtml
        });
      } else {
        setError("No se pudo extraer el HTML de la respuesta. Verifica que la IA haya generado el formato correcto.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFormattedValue = (value: unknown): string => {
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (Array.isArray(value)) {
      return String(value[value.length - 1]);
    }
    return String(value);
  };

  const filteredKeys = Object.keys(gVarData || {}).filter(key => !key.endsWith('_time'));

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-2xl font-bold text-gray-600">Cargando proyecto...</div>
    </div>
  );

  if (isError) return <Navigate to='/404' />;

  if (data) return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Dashboard
              </h1>
              <p className="text-xl font-light text-gray-500">
                Genera un dashboard HTML con inteligencia artificial
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-bold px-8 py-3 text-lg cursor-pointer transition-all rounded-xl shadow-sm hover:shadow-md flex items-center gap-2"
              to={`/projects/${projectId}/dashboard`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Variables Globales Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Variables Globales Disponibles
        </h2>
        <p className="text-gray-600 mb-4">
          Puedes referenciar estas variables en tu prompt para que la IA las incluya en el dashboard generado.
        </p>
        
        {gVarData ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Valor Actual
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKeys.map((key) => {
                  const varType = Array.isArray(gVarData[key]) ? 'array' : typeof gVarData[key];
                  return (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{key}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${varType === 'array' ? 'bg-blue-100 text-blue-800' : 
                          varType === 'boolean' ? 'bg-purple-100 text-purple-800' :
                          varType === 'number' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                          {varType}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {getFormattedValue(gVarData[key])}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Cargando variables globales...</p>
          </div>
        )}
      </div>

      {/* Prompt Input Section */}
      <div className="bg-[#120d18] rounded-xl shadow-lg overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-white mb-4 border-l-4 border-purple-400 pl-4">
          Genera tu Dashboard con IA
        </h2>
        
        <div className="mb-6">
          <label htmlFor="prompt" className="block text-gray-300 font-medium mb-2">
            Describe el dashboard que deseas generar:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Crea un dashboard con un grafico de barras para la variable temperatura, un indicador de estado para la variable activo, y un panel que muestre el valor de presion..."
            className="w-full h-48 px-4 py-3 bg-[#1a1625] text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            disabled={isGenerating}
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {aiResponse && (
          <div className="mb-4 p-4 bg-gray-800 border border-gray-600 rounded-lg">
            <h3 className="text-white font-bold mb-2">Respuesta de la IA:</h3>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
              {aiResponse}
            </pre>
          </div>
        )}

        <button
          onClick={handleGenerateAI}
          disabled={isGenerating || !prompt.trim()}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
            ${isGenerating || !prompt.trim() 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'}`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando Dashboard...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generar Dashboard con IA
            </>
          )}
        </button>
      </div>
    </div>
  );

  return null;
};

export default AIDashboardView;
