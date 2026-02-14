import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type CukiMessageProps = {
  content: string;
};

type Segment = {
  type: "markdown" | "code-raw";
  label: string;
  text: string;
};

/** Marker pairs that CukiMessage recognizes. Order matters — first match wins. */
const MARKERS = [
  { start: "---INICIOHTML---", end: "---FINHTML---", label: "HTML generado:" },
  { start: "---INICIOCODE---", end: "---FINCODE---", label: "Codigo generado:" },
] as const;

/** Split content into markdown segments and raw code blocks (HTML or JS). */
const splitContent = (content: string): Segment[] => {
  const segments: Segment[] = [];
  let remaining = content;

  while (remaining.length > 0) {
    // Find the earliest marker in the remaining text
    let earliestIdx = -1;
    let matchedMarker: (typeof MARKERS)[number] | null = null;

    for (const marker of MARKERS) {
      const idx = remaining.indexOf(marker.start);
      if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
        earliestIdx = idx;
        matchedMarker = marker;
      }
    }

    if (earliestIdx === -1 || !matchedMarker) {
      segments.push({ type: "markdown", label: "", text: remaining });
      break;
    }

    // Text before the marker is markdown
    if (earliestIdx > 0) {
      segments.push({ type: "markdown", label: "", text: remaining.substring(0, earliestIdx) });
    }

    const afterStart = remaining.substring(earliestIdx + matchedMarker.start.length);
    const endIdx = afterStart.indexOf(matchedMarker.end);

    if (endIdx === -1) {
      // No closing marker yet (streaming) — show everything after as raw
      segments.push({ type: "code-raw", label: matchedMarker.label, text: afterStart });
      break;
    }

    segments.push({ type: "code-raw", label: matchedMarker.label, text: afterStart.substring(0, endIdx) });
    remaining = afterStart.substring(endIdx + matchedMarker.end.length);
  }

  return segments;
};

const CukiMessage = ({ content }: CukiMessageProps) => {
  const segments = splitContent(content);

  return (
    <div className="cuki-message text-sm">
      {segments.map((seg, i) => {
        if (seg.type === "code-raw") {
          return (
            <div key={i} className="my-2">
              <div className="text-xs text-purple-400 font-semibold mb-1">
                {seg.label}
              </div>
              <pre className="bg-[#0d0a12] border border-gray-700 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap break-words">
                {seg.text.trim()}
              </pre>
            </div>
          );
        }

        return (
          <ReactMarkdown
            key={i}
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
              em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-gray-200">{children}</li>,
              code: ({ children, className }) => {
                const isBlock = className?.includes("language-");
                if (isBlock) {
                  return (
                    <pre className="bg-[#0d0a12] border border-gray-700 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto my-2">
                      <code>{children}</code>
                    </pre>
                  );
                }
                return (
                  <code className="bg-[#2a2435] text-purple-300 px-1.5 py-0.5 rounded text-xs">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => <>{children}</>,
              h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold text-white mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold text-white mb-1">{children}</h3>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-purple-500 pl-3 my-2 text-gray-400 italic">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-2">
                  <table className="text-xs border-collapse border border-gray-700">{children}</table>
                </div>
              ),
              th: ({ children }) => <th className="border border-gray-700 px-2 py-1 bg-[#2a2435] text-white font-semibold">{children}</th>,
              td: ({ children }) => <td className="border border-gray-700 px-2 py-1 text-gray-300">{children}</td>,
            }}
          >
            {seg.text}
          </ReactMarkdown>
        );
      })}
    </div>
  );
};

export default CukiMessage;
