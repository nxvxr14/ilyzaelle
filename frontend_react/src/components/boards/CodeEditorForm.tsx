import { CodeEditorFormData } from "@/types/index";
import { Editor } from "@monaco-editor/react";
import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import CodeEditorModal from "./CodeEditorModal";

export default function CodeEditorForm({ boardCode }: CodeEditorFormData) {
    const params = useParams();
    const projectId = params.projectId!;
    const boardId = params.boardId!;

    // Scroll reference for editor navigation
    const editorRef = useRef<HTMLDivElement>(null);
    const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // State for tracking code changes
    const [code, setCodeValue] = useState<string>(boardCode);

    return (
        <div 
            ref={editorRef}
            className="bg-[#120d18] rounded-2xl overflow-hidden"
        >
            {/* Header with editor title and action buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4">
                <h2
                    className="text-3xl text-[#d4d4d4] font-bold cursor-pointer pl-2"
                    onClick={() => scrollToSection(editorRef)}
                >
                    Editor
                </h2>
                
                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <CodeEditorModal boardCode={code} projectId={projectId} boardId={boardId} />
                </div>
            </div>
            
            {/* Monaco Editor - full width, preserving height */}
            <div className="px-4 pb-4">
                <Editor
                    defaultLanguage="javascript"
                    defaultValue={boardCode}
                    onChange={(code) => setCodeValue(code || '')}
                    options={{
                        wordWrap: "on",
                        wrappingIndent: "same",
                        fontSize: 14,
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        lineNumbers: "on",                     // "on", "off", or "relative"
                        renderLineHighlight: "all",            // "all", "line", "gutter", or "none"
                        cursorBlinking: "smooth",              // "blink", "smooth", "phase", "expand", "solid"
                        cursorStyle: "line",                   // "line", "block", "underline", "line-thin"
                        matchBrackets: "always", 
                        bracketPairColorization: { enabled: true }, // Colorize matching brackets
                        guides: {                              // Indentation guides
                          bracketPairs: true,
                          indentation: true,
                        },
                        quickSuggestions: true,                // Enable auto-suggestions
                        suggestOnTriggerCharacters: true,      // Show suggestions when typing trigger chars
                        formatOnPaste: true,                   // Auto-format pasted code
                        formatOnType: false, 
                        folding: false
                    }}
                    width="100%"
                    height="85vh" // Preserves the original height based on screen
                    theme="vs-dark"
                />
            </div>
        </div>
    );
}
