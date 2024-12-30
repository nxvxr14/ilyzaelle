import { CodeEditorFormData } from "@/types/index";
import { Editor } from "@monaco-editor/react";

export default function CodeEditorForm({boardCode} : CodeEditorFormData) {
    
    return (
        <div className="flex justify-center items-center h-screen">
            <Editor
                defaultLanguage="javascript"
                defaultValue = {boardCode}
                width="90%"     // Ocupa todo el ancho disponible
                className="w-3/5 h-4/5" // Ajusta el tamaño del editor
                theme="vs-dark"
            />
        </div>
    );
}
