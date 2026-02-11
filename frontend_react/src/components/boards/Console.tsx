import { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "@/context/SocketContext";

const MAX_LINES = 500;
const SCROLL_THRESHOLD = 40; // px from bottom to consider "at bottom"

export default function Console() {
    const { socket } = useContext(SocketContext);
    const [lines, setLines] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);

    // Track whether the user is scrolled to the bottom
    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        isAtBottomRef.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;
    };

    // Listen for new log lines from backend_local via the relay
    useEffect(() => {
        if (!socket) return;

        const handleLogLine = (line: string) => {
            setLines((prev) => {
                const updated = [...prev, line];
                return updated.length > MAX_LINES ? updated.slice(-MAX_LINES) : updated;
            });
        };

        socket.on("response-server-log-b-f", handleLogLine);

        return () => {
            socket.off("response-server-log-b-f", handleLogLine);
        };
    }, [socket]);

    // Auto-scroll only if user was already at the bottom
    useEffect(() => {
        const el = scrollRef.current;
        if (el && isAtBottomRef.current) {
            el.scrollTop = el.scrollHeight;
        }
    }, [lines]);

    const handleClear = () => {
        setLines([]);
    };

    return (
        <div className="bg-[#120d18] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4">
                <h2 className="text-3xl text-[#d4d4d4] font-bold pl-2">
                    Consola
                </h2>

                <button
                    className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2 rounded-lg transition-colors shadow-sm"
                    onClick={handleClear}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Limpiar
                </button>
            </div>

            {/* Log output */}
            <div className="px-4 pb-4">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="bg-[#1a1625] rounded-lg p-4 h-[30vh] overflow-y-auto font-mono text-sm"
                >
                    {lines.length === 0 ? (
                        <p className="text-gray-500 italic">Esperando logs del servidor...</p>
                    ) : (
                        lines.map((line, i) => (
                            <div key={i} className="text-[#d4d4d4] leading-6 whitespace-pre-wrap break-all">
                                {line}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
