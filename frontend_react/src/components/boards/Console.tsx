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
        <div className="flex flex-col h-full bg-[#120d18]">
            {/* Header */}
            <div className="shrink-0 flex justify-between items-center px-4 py-2">
                <h2 className="text-sm font-bold text-[#d4d4d4]">Consola</h2>
                <button
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-[#2a2435]"
                    onClick={handleClear}
                >
                    Limpiar
                </button>
            </div>

            {/* Log output */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto px-4 pb-2 font-mono text-xs"
            >
                {lines.length === 0 ? (
                    <p className="text-gray-500 italic">Esperando logs del servidor...</p>
                ) : (
                    lines.map((line, i) => (
                        <div key={i} className="text-[#d4d4d4] leading-5 whitespace-pre-wrap break-all">
                            {line}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
