import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBoardById, getBoardAIChatHistory, addBoardAIChatMessages, clearBoardAIChatHistory } from "@/api/BoardApi";
import { getProjectById } from "@/api/ProjectApi";
import Console from '@/components/boards/Console';
import CodeEditorModal from '@/components/boards/CodeEditorModal';
import CukiChat, { type ChatMessage } from '@/components/cuki/CukiChat';
import { Editor, DiffEditor } from "@monaco-editor/react";
import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { SocketContext } from "@/context/SocketContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MAX_LINES = 500;

const CODE_START_MARKER = "---INICIOCODE---";
const CODE_END_MARKER = "---FINCODE---";

const boardNames: { [key: number]: string } = {
    1: 'Arduino',
    2: 'Xelorium',
    3: 'Esp32',
    4: 'HTTP',
    5: 'MQTT',
    6: "Factory IO"
};

/** Extract code between ---INICIOCODE--- and ---FINCODE--- markers.
 *  Strips markdown fenced code block wrapping (```javascript ... ```) if present. */
function extractCodeFromResponse(response: string): string | null {
    const startIdx = response.indexOf(CODE_START_MARKER);
    const endIdx = response.indexOf(CODE_END_MARKER);
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        let code = response.substring(startIdx + CODE_START_MARKER.length, endIdx).trim();
        // Strip markdown fenced code block wrapping if present
        const fenceMatch = code.match(/^```(?:\w*)\n?([\s\S]*?)```$/);
        if (fenceMatch) {
            code = fenceMatch[1].trim();
        }
        return code;
    }
    return null;
}

function CodeEditorBoardView() {
    const params = useParams();
    const projectId = params.projectId!;
    const boardId = params.boardId!;
    const navigate = useNavigate();

    const { socket, setServerAPI } = useContext(SocketContext);
    const queryClient = useQueryClient();

    const [showConsole, setShowConsole] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [code, setCode] = useState<string>("");
    const [editorReady, setEditorReady] = useState(false);
    const [consoleLines, setConsoleLines] = useState<string[]>([]);

    // DiffEditor state
    const [proposedCode, setProposedCode] = useState<string | null>(null);
    // Context note for the next message after rejection
    const [rejectionNote, setRejectionNote] = useState<string | null>(null);

    const rootRef = useRef<HTMLDivElement>(null);
    const chatOverlayRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const showConsoleRef = useRef(showConsole);
    showConsoleRef.current = showConsole;
    const codeRef = useRef(code);
    codeRef.current = code;

    // Accumulate console logs regardless of console visibility
    useEffect(() => {
        if (!socket) return;

        const handleLogLine = (line: string) => {
            setConsoleLines((prev) => {
                const updated = [...prev, line];
                return updated.length > MAX_LINES ? updated.slice(-MAX_LINES) : updated;
            });
        };

        socket.on("response-server-log-b-f", handleLogLine);
        return () => { socket.off("response-server-log-b-f", handleLogLine); };
    }, [socket]);

    const handleClearConsole = useCallback(() => {
        setConsoleLines([]);
    }, []);

    // Prevent page-level scroll on mobile (overscroll into white space)
    useEffect(() => {
        const preventDocumentScroll = (e: TouchEvent) => {
            let target = e.target as HTMLElement | null;
            while (target && target !== document.documentElement) {
                if (
                    target.classList.contains('monaco-scrollable-element') ||
                    target.scrollHeight > target.clientHeight
                ) {
                    return;
                }
                target = target.parentElement;
            }
            e.preventDefault();
        };

        document.addEventListener('touchmove', preventDocumentScroll, { passive: false });
        return () => document.removeEventListener('touchmove', preventDocumentScroll);
    }, []);

    // Mobile keyboard: adapt container height + auto-close console + resize chat overlay
    useLayoutEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;

        const onResize = () => {
            const el = rootRef.current;
            if (el) el.style.height = `${vv.height}px`;

            // Only resize the chat overlay on mobile (when it's fixed/fullscreen).
            // On desktop (md:static), the overlay height comes from flexbox — setting
            // inline height would break the flex layout and push the textarea out of view.
            const overlay = chatOverlayRef.current;
            if (overlay) {
                const isFixed = window.getComputedStyle(overlay).position === 'fixed';
                if (isFixed) {
                    overlay.style.height = `${vv.height}px`;
                } else {
                    overlay.style.height = '';
                }
            }

            // Scroll chat to bottom so latest messages stay visible above keyboard
            if (chatContainerRef.current) {
                requestAnimationFrame(() => {
                    chatContainerRef.current!.scrollTop = chatContainerRef.current!.scrollHeight;
                });
            }

            const keyboardOpen = vv.height < window.innerHeight * 0.85;
            if (keyboardOpen && showConsoleRef.current) {
                setShowConsole(false);
            }
        };

        vv.addEventListener("resize", onResize);
        return () => vv.removeEventListener("resize", onResize);
    }, []);

    // Fetch project to get serverAPIKey for socket connection
    const { data: projectData } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => getProjectById(projectId),
    });

    // Connect socket when project data loads
    useEffect(() => {
        if (projectData) {
            setServerAPI(projectData.serverAPIKey);
        }
    }, [projectData, setServerAPI]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['CodeEditorBoard', boardId],
        queryFn: () => getBoardById({ projectId, boardId }),
        enabled: !!boardId
    });

    // Initialize code when data loads
    useEffect(() => {
        if (data && !editorReady) {
            setCode(data.boardCode);
            setEditorReady(true);
        }
    }, [data, editorReady]);

    // --- Chat history persistence per board ---
    const { data: chatHistory } = useQuery({
        queryKey: ['boardChatHistory', boardId],
        queryFn: () => getBoardAIChatHistory({ projectId, boardId }),
        enabled: !!boardId,
    });

    const handleMessagesChange = useCallback((msgs: ChatMessage[]) => {
        // Filter out messages with empty content to prevent Mongoose validation errors
        const mapped = msgs
            .filter(m => m.content.trim() !== '')
            .map(m => ({ role: m.role, content: m.content }));
        // Persist all messages to backend (bulk replace)
        addBoardAIChatMessages({ projectId, boardId, messages: mapped });
        // Update TanStack Query cache immediately so re-entry gets fresh data
        queryClient.setQueryData(['boardChatHistory', boardId], mapped);
    }, [projectId, boardId, queryClient]);

    const handleClearChatHistory = useCallback(() => {
        clearBoardAIChatHistory({ projectId, boardId });
        // Clear the TanStack Query cache immediately
        queryClient.setQueryData(['boardChatHistory', boardId], []);
    }, [projectId, boardId, queryClient]);

    // --- Cuki Code Chat: system prompt builder ---
    const getSystemPrompt = useCallback(() => {
        const currentCode = codeRef.current;
        const boardType = data ? (boardNames[data.boardType] || 'Desconocido') : 'Arduino';

        return `Eres Cuki, un perro AI asistente de estudiantes de ingenieria. Ayudas a programar controladores IoT.

CONTEXTO:
- El estudiante trabaja en la plataforma Ilyzaelle (SCADA/HMI educativo)
- Board actual: ${boardType}
- Se programa con JavaScript usando la libreria Firmata.js (protocolo Firmata)
- NO se usa johnny-five. NO uses funciones ni clases de johnny-five (new five.Led, new five.Sensor, five.Board, etc.)
- El objeto "board" ya esta definido e inicializado internamente — NO lo redeclares con let/const/var
- Los objetos "varG" y "gVar[project]" son variables globales compartidas entre controladores, ya definidas internamente — NO los redeclares
- varG.nombreVariable = valor → escribe una variable global
- varG.nombreVariable → lee una variable global
- Las variables globales se comparten entre TODOS los controladores del proyecto en tiempo real

API FIRMATA DISPONIBLE (metodos del objeto board):
- board.pinMode(pin, mode) — modos: board.MODES.INPUT, board.MODES.OUTPUT, board.MODES.ANALOG, board.MODES.PWM, board.MODES.SERVO
- board.digitalWrite(pin, value) — HIGH (1) o LOW (0)
- board.digitalRead(pin, callback) — callback(value)
- board.analogWrite(pin, value) — PWM 0-255
- board.analogRead(pin, callback) — callback(value) 0-1023
- board.servoWrite(pin, degrees) — 0-180
- board.i2cConfig(options)
- board.i2cWrite(address, register, data)
- board.i2cRead(address, register, bytesToRead, callback)
- setInterval(callback, ms) / setTimeout(callback, ms) — para loops periodicos

FUNCIONES Y METODOS PROHIBIDOS (NO EXISTEN en Firmata.js):
- board.loop() — NO EXISTE, usa setInterval() en su lugar
- board.wait() — NO EXISTE, usa setTimeout() en su lugar
- new five.Led(), new five.Sensor(), new five.Motor(), new five.Board() — NO EXISTE, esto es johnny-five
- board.on("ready", ...) — NO lo uses, el board ya esta listo cuando se ejecuta el codigo

INICIALIZACION DE VARIABLES GLOBALES (varG):
- Asigna directamente al inicio del codigo: varG.miVariable = 0
- NO uses condicionales para inicializar: if (typeof varG.x === 'undefined') { ... } — esto es innecesario
- Ejemplo correcto:
  varG.contador = 0
  varG.estado = false
  varG.datos = []

CODIGO ACTUAL DEL ESTUDIANTE:
\`\`\`javascript
${currentCode}
\`\`\`

FORMATO DE RESPUESTA:
1. Explica brevemente que cambios hiciste y por que (maximo 3-5 lineas)
2. Si hiciste cambios al codigo, devuelve el codigo COMPLETO modificado entre estos delimitadores:
   ---INICIOCODE---
   [codigo completo aqui, SIN envolver en backticks markdown]
   ---FINCODE---
3. Si solo es una pregunta o explicacion sin cambios de codigo, NO uses los delimitadores
4. Da recomendaciones breves si aplica

REGLAS IMPORTANTES:
- NUNCA redeclares board, varG ni gVar — ya existen
- El codigo debe ser JavaScript valido para Firmata.js (protocolo Firmata), NO johnny-five
- Para ESP32 con Firmata, los pines pueden ser diferentes (ej: GPIO)
- Devuelve SIEMPRE el codigo completo, no solo fragmentos
- Se conciso en las explicaciones, el estudiante ve el chat en un panel lateral
- NUNCA envuelvas el codigo entre los delimitadores en backticks markdown (\`\`\`), pon el codigo directamente
- Si el estudiante pide algo que no tiene sentido con Firmata, explicale por que`;
    }, [data]);

    // --- Handle AI response: extract code and show diff ---
    const handleAIResponse = useCallback((fullText: string) => {
        const extracted = extractCodeFromResponse(fullText);
        if (extracted) {
            setProposedCode(extracted);
        }
    }, []);

    const handleAcceptChanges = useCallback(() => {
        if (proposedCode !== null) {
            setCode(proposedCode);
            setProposedCode(null);
        }
    }, [proposedCode]);

    const handleRejectChanges = useCallback(() => {
        setProposedCode(null);
        setRejectionNote("El estudiante RECHAZO tu ultima propuesta de codigo. Ten en cuenta sus comentarios para la siguiente propuesta.");
    }, []);

    if (isLoading) return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#120d18]">
            <div className="animate-pulse text-xl font-bold text-gray-400">Cargando editor...</div>
        </div>
    );

    if (isError) return <Navigate to={'/404'} />;

    if (data) return (
        <div ref={rootRef} className="fixed inset-0 flex flex-col bg-[#120d18] overflow-hidden overscroll-none touch-manipulation">
            {/* Top bar */}
            <div className="shrink-0 flex items-center justify-between px-3 py-2 bg-[#1a1625] border-b border-gray-800">
                {/* Left: back button + board info */}
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        onClick={() => navigate(`/projects/${projectId}`)}
                        className="shrink-0 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#2a2435]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-sm font-bold text-white truncate">{data.boardName}</h1>
                    <span className="text-xs text-gray-500 hidden sm:inline">|</span>
                    <span className="text-xs text-gray-400 hidden sm:inline">{boardNames[data.boardType] || 'Desconocido'}</span>
                    <div className={`shrink-0 w-2.5 h-2.5 rounded-full ${data.active ? 'bg-green-500' : 'bg-red-500'}`}
                        title={data.active ? 'Conectado' : 'Desconectado'}
                    />
                </div>

                {/* Right: cuki + console toggle + action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Cuki chat toggle */}
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={`p-2 rounded-lg transition-colors ${
                            showChat
                                ? 'text-purple-400 bg-[#2a2435]'
                                : 'text-gray-400 hover:text-white hover:bg-[#2a2435]'
                        }`}
                        title={showChat ? 'Ocultar Cuki' : 'Abrir Cuki'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
                            <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
                            <path d="M8 14v.5" /><path d="M16 14v.5" />
                            <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
                            <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306" />
                        </svg>
                    </button>

                    {/* Console toggle */}
                    <button
                        onClick={() => setShowConsole(!showConsole)}
                        className={`p-2 rounded-lg transition-colors ${
                            showConsole
                                ? 'text-yellow-400 bg-[#2a2435]'
                                : 'text-gray-400 hover:text-white hover:bg-[#2a2435]'
                        }`}
                        title={showConsole ? 'Ocultar consola' : 'Mostrar consola'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>

                    {/* BURN + Save */}
                    <CodeEditorModal boardCode={proposedCode ?? code} projectId={projectId} boardId={boardId} />
                </div>
            </div>

            {/* DiffEditor accept/reject bar */}
            {proposedCode !== null && (
                <div className="shrink-0 flex items-center justify-between px-3 py-2 bg-[#2a1f35] border-b border-purple-800">
                    <span className="text-xs text-purple-300 font-semibold">
                        Cuki propone cambios en el codigo
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAcceptChanges}
                            className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer font-medium"
                        >
                            Aceptar
                        </button>
                        <button
                            onClick={handleRejectChanges}
                            className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer font-medium"
                        >
                            Rechazar
                        </button>
                    </div>
                </div>
            )}

            {/* Main content: editor (+ optional chat panel) */}
            <div className="flex-1 flex min-h-0">
                {/* Editor column */}
                <div className="flex-1 flex flex-col min-h-0 min-w-0">
                    {/* Monaco Editor or DiffEditor */}
                    <div className="flex-1 min-h-0">
                        {proposedCode !== null ? (
                            <DiffEditor
                                original={code}
                                modified={proposedCode}
                                language="javascript"
                                theme="vs-dark"
                                width="100%"
                                height="100%"
                                options={{
                                    readOnly: true,
                                    renderSideBySide: false, // Inline diff (better for narrow screens)
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    padding: { top: 8 },
                                }}
                            />
                        ) : (
                            <Editor
                                defaultLanguage="javascript"
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                options={{
                                    wordWrap: "on",
                                    wrappingIndent: "same",
                                    fontSize: 14,
                                    minimap: { enabled: true },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 2,
                                    lineNumbers: "on",
                                    renderLineHighlight: "all",
                                    cursorBlinking: "smooth",
                                    cursorStyle: "line",
                                    matchBrackets: "always",
                                    bracketPairColorization: { enabled: true },
                                    guides: {
                                        bracketPairs: true,
                                        indentation: true,
                                    },
                                    quickSuggestions: true,
                                    suggestOnTriggerCharacters: true,
                                    formatOnPaste: true,
                                    formatOnType: false,
                                    folding: false,
                                    padding: { top: 8 },
                                }}
                                width="100%"
                                height="100%"
                                theme="vs-dark"
                            />
                        )}
                    </div>

                    {/* Toggleable Console panel */}
                    {showConsole && (
                        <div className="shrink-0 h-[30vh] border-t border-gray-800">
                            <Console lines={consoleLines} onClear={handleClearConsole} />
                        </div>
                    )}
                </div>

                {/* Chat panel — Desktop: 1/3 width side panel, Mobile: fullscreen overlay */}
                {/* Always rendered (hidden via CSS) to preserve state */}
                <div ref={chatOverlayRef} className={`${
                    showChat ? 'flex' : 'hidden'
                } flex-col bg-[#120d18] border-l border-gray-800
                  fixed inset-0 z-50
                  md:static md:z-auto md:w-1/3 md:min-w-[280px] md:max-w-[400px] md:min-h-0 md:overflow-hidden`}
                >
                    {/* Mobile-only close button */}
                    <div className="shrink-0 flex items-center justify-end px-3 py-2 bg-[#1a1625] border-b border-gray-800 md:hidden">
                        <button
                            onClick={() => setShowChat(false)}
                            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#2a2435]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 min-h-0">
                        <CukiChat
                            getSystemPrompt={getSystemPrompt}
                            onAIResponse={handleAIResponse}
                            placeholder="Describe que quieres hacer con el codigo..."
                            emptyTitle="Cuki"
                            emptyDescription="Describe lo que necesitas y te ayudo a programar tu controlador."
                            disabled={proposedCode !== null}
                            disabledMessage="Acepta o rechaza los cambios propuestos antes de continuar."
                            contextNote={rejectionNote}
                            onContextNoteConsumed={() => setRejectionNote(null)}
                            initialMessages={chatHistory?.map((m: { role: string; content: string }) => ({ role: m.role as 'user' | 'assistant', content: m.content })) ?? []}
                            onMessagesChange={handleMessagesChange}
                            onClearHistory={handleClearChatHistory}
                            chatContainerRef={chatContainerRef}
                        />
                    </div>
                </div>
            </div>

            <ToastContainer />
        </div>
    );

    return null;
}

export default CodeEditorBoardView;
