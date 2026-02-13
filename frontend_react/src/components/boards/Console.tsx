import { useEffect, useRef } from "react";

const SCROLL_THRESHOLD = 40; // px from bottom to consider "at bottom"

type ConsoleProps = {
    lines: string[];
    onClear: () => void;
};

export default function Console({ lines, onClear }: ConsoleProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);

    // Track whether the user is scrolled to the bottom
    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        isAtBottomRef.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;
    };

    // Auto-scroll only if user was already at the bottom
    useEffect(() => {
        const el = scrollRef.current;
        if (el && isAtBottomRef.current) {
            el.scrollTop = el.scrollHeight;
        }
    }, [lines]);

    return (
        <div className="flex flex-col h-full bg-[#120d18]">
            {/* Header */}
            <div className="shrink-0 flex justify-between items-center px-4 py-2">
                <h2 className="text-sm font-bold text-[#d4d4d4]">Consola</h2>
                <button
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-[#2a2435]"
                    onClick={onClear}
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
