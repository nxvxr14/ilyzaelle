import { getProjectById } from "@/api/ProjectApi";
import { updateAIDashWithCode, getAIChatHistory, addAIChatMessages, clearAIChatHistory, AIChatMessage } from "@/api/ProjectApi";
import { SocketContext } from "@/context/SocketContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import GVarPopup from "@/components/cuki/GVarPopup";
import CukiMessage from "@/components/cuki/CukiMessage";

const CUKI_IA_API = import.meta.env.VITE_CUKI_IA_API;

const AIDashboardView = () => {
  const params = useParams();
  const projectId = params.projectId!;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { socket, setServerAPI } = useContext(SocketContext);
  const [gVarData, setGVarData] = useState<Record<string, unknown>>(null as unknown as Record<string, unknown>);
  const [serverAPIKey, setServerAPIKeyLocal] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([]);
  const [dashCode, setDashCode] = useState<string>("");
  const [showGVarPopup, setShowGVarPopup] = useState(false);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const retryFlagRef = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Data fetching (unchanged logic) ---

  const { data, isLoading, isError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
  });

  const { data: chatHistoryData } = useQuery({
    queryKey: ['chatHistory', projectId],
    queryFn: () => getAIChatHistory(projectId),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (chatHistoryData) {
      setChatMessages(chatHistoryData);
    }
  }, [chatHistoryData]);

  const updateAIDashMutation = useMutation({
    mutationFn: updateAIDashWithCode,
    onSuccess: (data) => {
      if (data?.AIDashCode) {
        setDashCode(data.AIDashCode);
      }
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['aidash', projectId] });
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const addMessagesMutation = useMutation({
    mutationFn: ({ messages }: { messages: AIChatMessage[] }) =>
      addAIChatMessages(projectId, messages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory', projectId] });
    }
  });

  const clearHistoryMutation = useMutation({
    mutationFn: () => clearAIChatHistory(projectId),
    onSuccess: () => {
      setChatMessages([]);
      setAiResponse("");
      setDashCode("");
      queryClient.invalidateQueries({ queryKey: ['chatHistory', projectId] });
    }
  });

  // --- Socket.IO for gVar polling ---

  useEffect(() => {
    if (data) {
      setServerAPI(data.serverAPIKey);
      setServerAPIKeyLocal(data.serverAPIKey);
    }
  }, [data, setServerAPI]);

  useEffect(() => {
    if (socket && serverAPIKey) {
      const handleUpdateGVar = (gVarData: Record<string, unknown>, responseServerAPIKey: string, responseProjectId: string) => {
        if (responseServerAPIKey === serverAPIKey && responseProjectId === projectId) {
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

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, aiResponse]);

  // --- AI logic (unchanged) ---

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

  const getSystemPrompt = (): string => {
  return `
Eres un generador de dashboards HTML interactivos llamado Cuki, eres un perro AI informatico. Tu output siempre es un archivo HTML completo (CSS+JS+HTML en uno solo) usando Socket.IO para conectar a 'https://undercromo.dev' y manipular variables globales (gVar):

Formatea así:
---INICIOHTML--- [tu código aquí] ---FINHTML---

Configuración fija:
Incluye el siguiente código base, adaptando solo el contenido de onDataReceived(data):
js

<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>

const CONFIG = {
    serverAPIKey: '${serverAPIKey}',
    projectId: '${projectId}',
    socketUrl: 'https://undercromo.dev',
    updateInterval: 500
};
let socket=null, gVarData={}, isConnected=false;
function initSocket() {
    socket=io(CONFIG.socketUrl,{transports:['websocket','polling']});
    socket.on('connect',()=>{isConnected=true;socket.emit('join-server',CONFIG.serverAPIKey);startDataPolling();});
    socket.on('disconnect',()=>{isConnected=false;stopDataPolling();});
    socket.on('response-gVar-update-b-f',(data,key,pid)=>{if(key===CONFIG.serverAPIKey&&pid===CONFIG.projectId){gVarData=data;onDataReceived(gVarData);}});
}
function startDataPolling(){requestGVarUpdate();setInterval(()=>isConnected&&requestGVarUpdate(),CONFIG.updateInterval);}
function stopDataPolling(){clearInterval(updateIntervalId);}
function requestGVarUpdate(){socket.emit('request-gVar-update-f-b',CONFIG.projectId,CONFIG.serverAPIKey);}
function createVariable(name,value){socket.emit('request-gVarriable-initialize-f-b',CONFIG.projectId,name,value,CONFIG.serverAPIKey);}
function updateVariable(name,val){socket.emit('request-gVariable-change-f-b',name,val,CONFIG.projectId,CONFIG.serverAPIKey);}
function deleteVariable(name){socket.emit('request-gVariable-delete-f-b',CONFIG.projectId,name,CONFIG.serverAPIKey);}
function readVariable(name){return gVarData[name];}
function readAllVariables(){return Object.fromEntries(Object.entries(gVarData).filter(([k])=>!k.endsWith('_time')));}
function onDataReceived(data){/* Actualiza dashboard aquí */}
document.addEventListener('DOMContentLoaded',initSocket);

Operaciones CRUD disponibles:

    createVariable(name, value)
    readVariable(name)
    readAllVariables()
    updateVariable(name, newValue)
    deleteVariable(name)

Normas:

    La UI debe actualizarse en onDataReceived(data)
    Usa readVariable() para valores específicos
    Codigo moderno, responsivo y con CSS mínimo
    No archivos separados ni assets externos (excepto Socket.IO)

  `;
  };

  const getLast5Messages = (): { role: string; content: string }[] => {
    const systemMessage = { role: 'system', content: getSystemPrompt() };
    const lastMessages = chatMessages.slice(-5).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    return [systemMessage, ...lastMessages];
  };

  const estimateTokens = (text: string): number => {
    const charBasedEstimate = Math.ceil(text.length / 4);
    const words = text.split(/\s+/).length;
    const wordBasedEstimate = Math.ceil(words * 1.3);
    return Math.ceil((charBasedEstimate + wordBasedEstimate) / 2);
  };

  const calculateTotalTokens = (messages: { role: string; content: string }[]): number => {
    return messages.reduce((total, msg) => {
      return total + estimateTokens(msg.content) + 4;
    }, 0);
  };

  const handleGenerateAI = async () => {
    if (!prompt.trim()) {
      setError("Por favor, ingresa un prompt para generar el dashboard.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setAiResponse("");
    setFailedMessage(null);

    const userMessage: AIChatMessage = { role: 'user', content: prompt };
    const currentPrompt = prompt;
    setPrompt("");
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setChatMessages(prev => [...prev, userMessage]);

    const contextMessages = getLast5Messages();
    contextMessages.push({ role: 'user', content: currentPrompt });

    const totalInputTokens = calculateTotalTokens(contextMessages);
    console.group('%c[Cuki] Enviando mensaje a la API', 'color: #9333ea; font-weight: bold; font-size: 14px;');
    console.log('%cMensajes enviados:', 'color: #6366f1; font-weight: bold;');
    contextMessages.forEach((msg, index) => {
      const tokenCount = estimateTokens(msg.content) + 4;
      console.log(`  [${index + 1}] ${msg.role.toUpperCase()} (~${tokenCount} tokens):`);
      if (msg.role === 'system') {
        console.log(`      (System prompt - ${msg.content.length} caracteres)`);
      } else {
        console.log(`      "${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}"`);
      }
    });
    console.log('%cTotal mensajes:', 'color: #22c55e; font-weight: bold;', contextMessages.length);
    console.log('%cTokens estimados (entrada):', 'color: #f59e0b; font-weight: bold;', `~${totalInputTokens} tokens`);
    console.groupEnd();

    try {
      const response = await fetch(CUKI_IA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: contextMessages }),
      });

      if (!response.ok) {
        throw new Error('Error al comunicarse con la API de IA');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No se pudo obtener el lector del stream');
      }

      const decoder = new TextDecoder();
      let fullText = '';

      const readStream = async (): Promise<string> => {
        const { done, value } = await reader.read();
        if (done) return fullText;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setAiResponse(fullText);
        return readStream();
      };

      await readStream();

      const outputTokens = estimateTokens(fullText);
      console.group('%c[Cuki] Respuesta recibida', 'color: #22c55e; font-weight: bold; font-size: 14px;');
      console.log('%cTokens estimados (salida):', 'color: #f59e0b; font-weight: bold;', `~${outputTokens} tokens`);
      console.log('%cTotal tokens (entrada + salida):', 'color: #ef4444; font-weight: bold;', `~${totalInputTokens + outputTokens} tokens`);
      console.groupEnd();

      const assistantMessage: AIChatMessage = { role: 'assistant', content: fullText };
      setChatMessages(prev => [...prev, assistantMessage]);

      addMessagesMutation.mutate({ messages: [userMessage, assistantMessage] });

      const extractedHtml = extractHtmlFromResponse(fullText);

      if (extractedHtml) {
        updateAIDashMutation.mutate({ projectId, AIDash: extractedHtml });
      } else {
        setError("No se pudo extraer el HTML de la respuesta. Verifica que la IA haya generado el formato correcto.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setFailedMessage(currentPrompt);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewChat = () => {
    if (confirm("Iniciar un nuevo chat? Se eliminara todo el historial.")) {
      clearHistoryMutation.mutate();
      setFailedMessage(null);
    }
  };

  const handleRetry = () => {
    if (!failedMessage) return;
    // Remove the failed user message before resending
    setChatMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'user' && last.content === failedMessage) {
        return prev.slice(0, -1);
      }
      return prev;
    });
    const retryPrompt = failedMessage;
    setFailedMessage(null);
    setError("");
    setPrompt(retryPrompt);
    retryFlagRef.current = true;
  };

  // Auto-send on retry
  useEffect(() => {
    if (retryFlagRef.current && prompt.trim() && !isGenerating) {
      retryFlagRef.current = false;
      handleGenerateAI();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && prompt.trim()) {
        handleGenerateAI();
      }
    }
  };

  // Auto-resize textarea up to 7 lines
  const autoResizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const lineHeight = 20; // text-sm (~14px) * line-height (~1.43)
    const maxHeight = lineHeight * 7 + 24; // 7 lines + vertical padding (py-3 = 12px * 2)
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  // --- Render ---

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-[#120d18]">
      <div className="animate-pulse text-2xl font-bold text-gray-400">Cargando...</div>
    </div>
  );

  if (isError) return <Navigate to='/404' />;

  if (data) return (
    <div className="flex flex-col h-screen bg-[#120d18]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1625] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/projects/${projectId}/dashboard`)}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#2a2435]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white">Cuki</h1>
          <span className="text-sm text-gray-500">|</span>
          <span className="text-sm text-gray-400">{data.projectName}</span>
        </div>

        <div className="flex items-center gap-2">
          {dashCode && (
            <a
              href={`/public/dashboard/${dashCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-[#2a2435] flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              AI Dash
            </a>
          )}
          <button
            onClick={handleNewChat}
            disabled={chatMessages.length === 0 || clearHistoryMutation.isPending}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              chatMessages.length === 0 || clearHistoryMutation.isPending
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-red-400 hover:text-red-300 hover:bg-[#2a2435] cursor-pointer'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Chat
          </button>
        </div>
      </div>

      {/* Chat messages area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Empty state */}
          {chatMessages.length === 0 && !isGenerating && (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
              <div className="text-5xl font-black text-purple-500 mb-4">Cuki</div>
              <p className="text-gray-400 text-lg mb-2">Generador de dashboards con IA</p>
              <p className="text-gray-600 text-sm max-w-md">
                Describe el dashboard que necesitas y Cuki generara el HTML con conexion Socket.IO a tus variables globales.
              </p>
            </div>
          )}

          {/* Chat messages */}
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#1a1625] text-gray-200 border border-gray-800'
              }`}>
                <p className="text-xs font-semibold mb-1 opacity-70">
                  {msg.role === 'user' ? 'Tu' : 'Cuki'}
                </p>
                {msg.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                ) : (
                  <CukiMessage content={msg.content} />
                )}
              </div>
            </div>
          ))}

          {/* Error with retry button */}
          {error && !isGenerating && (
            <div className="flex justify-end">
              <div className="max-w-[80%] space-y-2">
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
                {failedMessage && (
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-[#2a2435] cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reintentar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Streaming response */}
          {aiResponse && isGenerating && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-[#1a1625] text-gray-200 border border-gray-800">
                <p className="text-xs font-semibold mb-1 opacity-70">Cuki</p>
                <CukiMessage content={aiResponse} />
              </div>
            </div>
          )}

          {/* Generating indicator */}
          {isGenerating && !aiResponse && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 bg-[#1a1625] border border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-800 bg-[#1a1625] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          {/* gVar popup button */}
          <div className="relative">
            <button
              onClick={() => setShowGVarPopup(!showGVarPopup)}
              className="text-gray-400 hover:text-yellow-400 transition-colors p-2.5 rounded-lg hover:bg-[#2a2435] text-sm font-bold"
              title="Ver variables globales"
            >
              gVar
            </button>

            {showGVarPopup && (
              <GVarPopup
                gVarData={gVarData}
                onClose={() => setShowGVarPopup(false)}
                onInsert={(varName) => {
                  setPrompt(prev => prev + varName);
                  setShowGVarPopup(false);
                  textareaRef.current?.focus();
                }}
              />
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              autoResizeTextarea();
            }}
            onKeyDown={handleKeyDown}
            placeholder={chatMessages.length > 0
              ? "Describe los cambios que necesitas..."
              : "Describe el dashboard que deseas generar..."
            }
            className="flex-1 bg-[#120d18] text-white border border-gray-700 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-600 min-h-[44px] overflow-y-auto"
            style={{ maxHeight: `${20 * 7 + 24}px` }}
            rows={1}
            disabled={isGenerating}
          />

          {/* Send button */}
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating || !prompt.trim()}
            className={`p-2.5 rounded-xl transition-colors ${
              isGenerating || !prompt.trim()
                ? 'text-gray-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return null;
};

export default AIDashboardView;
