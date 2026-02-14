import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { getBoardById } from "@/api/BoardApi";
import { getProjectById } from "@/api/ProjectApi";
import Console from '@/components/boards/Console';
import CodeEditorModal from '@/components/boards/CodeEditorModal';
import { Editor } from "@monaco-editor/react";
import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { SocketContext } from "@/context/SocketContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MAX_LINES = 500;

const boardNames: { [key: number]: string } = {
    1: 'Arduino',
    2: 'Xelorium',
    3: 'Esp32',
    4: 'HTTP',
    5: 'MQTT',
    6: "Factory IO"
};

function CodeEditorBoardView() {
    const params = useParams();
    const projectId = params.projectId!;
    const boardId = params.boardId!;
    const navigate = useNavigate();

    const { socket, setServerAPI } = useContext(SocketContext);

    const [showConsole, setShowConsole] = useState(false);
    const [code, setCode] = useState<string>("");
    const [editorReady, setEditorReady] = useState(false);
    const [consoleLines, setConsoleLines] = useState<string[]>([]);

    const rootRef = useRef<HTMLDivElement>(null);
    const showConsoleRef = useRef(showConsole);
    showConsoleRef.current = showConsole;

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

    // Prevent page-level scroll on mobile (overscroll into white space).
    // Blocks touchmove on the document except inside scrollable children
    // (Monaco editor and console panel handle their own scroll internally).
    useEffect(() => {
        const preventDocumentScroll = (e: TouchEvent) => {
            // Allow scroll inside elements that are internally scrollable
            // (Monaco's .monaco-scrollable-element, console's overflow-y-auto div)
            let target = e.target as HTMLElement | null;
            while (target && target !== document.documentElement) {
                if (
                    target.classList.contains('monaco-scrollable-element') ||
                    target.scrollHeight > target.clientHeight
                ) {
                    return; // Allow natural scroll inside these elements
                }
                target = target.parentElement;
            }
            e.preventDefault();
        };

        document.addEventListener('touchmove', preventDocumentScroll, { passive: false });
        return () => document.removeEventListener('touchmove', preventDocumentScroll);
    }, []);

    // Mobile keyboard: adapt container height + auto-close console
    useLayoutEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;

        const onResize = () => {
            const el = rootRef.current;
            if (!el) return;
            el.style.height = `${vv.height}px`;

            // If keyboard opened (viewport shrank significantly), close console
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
    if (data && !editorReady) {
        setCode(data.boardCode);
        setEditorReady(true);
    }

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

                {/* Right: console toggle + action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2435] transition-colors"
                        title="Cuki"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
                            <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
                            <path d="M8 14v.5" /><path d="M16 14v.5" />
                            <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
                            <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306" />
                        </svg>
                    </button>
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
                    <CodeEditorModal boardCode={code} projectId={projectId} boardId={boardId} />
                </div>
            </div>

            {/* Editor + Console */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Monaco Editor */}
                <div className="flex-1 min-h-0">
                    <Editor
                        defaultLanguage="javascript"
                        defaultValue={data.boardCode}
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
                </div>

                {/* Toggleable Console panel */}
                {showConsole && (
                    <div className="shrink-0 h-[30vh] border-t border-gray-800">
                        <Console lines={consoleLines} onClear={handleClearConsole} />
                    </div>
                )}
            </div>

            <ToastContainer />
        </div>
    );

    return null;
}

export default CodeEditorBoardView;
