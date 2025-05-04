import { CodeEditorFormData } from "@/types/index";
import { Editor } from "@monaco-editor/react";
import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import CodeEditorModal from "./CodeEditorModal";

export default function CodeEditorForm({ boardCode }: CodeEditorFormData) {

    const params = useParams()
    const projectId = params.projectId!
    const boardId = params.boardId!

    // aca hago un scroll para ajustar el editor en la pantalla con un click
    const editorRef = useRef<HTMLDivElement>(null);
    const consoleRef = useRef<HTMLDivElement>(null);
    const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // para ir guardando en una variable los cambios para posteriormente enviarlos al backend como post
    const [code, setCodeValue] = useState<string>(boardCode);  // Se inicializa como cadena vacía

    return (
        <>
            <div className="grid grid-cols-2 h-screen w-full bg-[#120d18] rounded-2xl overflow-hidden">
                {/* Primer div que ocupa la mitad del espacio */}
                <div
                    ref={editorRef}
                    className="flex flex-col justify-start items-start pl-4"
                >
                    {/* Encabezado h1 alineado a la izquierda */}
                    <h1
                        className="text-3xl text-[#d4d4d4] font-bold m-5 cursor-pointer"
                        onClick={() => scrollToSection(editorRef)}
                    >
                        editor
                    </h1>

                    <Editor
                        // funciones
                        defaultLanguage="javascript"
                        defaultValue={boardCode}
                        onChange={(code) => setCodeValue(code || '')} // Si `code` es `undefined`, se usa una cadena vacía.
                        // estilos
                        options={{
                            wordWrap: "on",
                            wrappingIndent: "same",
                        }}
                        width="97%"
                        height="85%"
                        theme="vs-dark"
                    />
                </div>

                    <CodeEditorModal boardCode={code} projectId={projectId} boardId={boardId} />
                
                </div>


        </>
    );
}
