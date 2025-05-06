// input.tsx
import { SocketContext } from "@/context/SocketContext";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";

type varProps = {
    selectedVar: string;
    gVar: any;
    serverAPIKey?: string; // Añadir prop para serverAPIKey
};

function InputVar({ selectedVar, gVar, serverAPIKey }: varProps) {
    const params = useParams();
    // Use '!' to assert that the value will always be present in the params
    const projectId = params.projectId!;

    const [inputVar, setInputVar] = useState<number>(gVar[selectedVar]); // Inicializamos con el valor actual
    const { socket } = useContext(SocketContext);

    const handleUpdateClick = () => {
        if (!socket) {
            console.error("Socket not connected");
            return;
        }
        console.log("input "+gVar[selectedVar]+" new value: "+inputVar+" with serverAPIKey: "+serverAPIKey);
        socket.emit("request-gVariable-change-f-b", selectedVar, inputVar, projectId, serverAPIKey, (response: any) => {
            // Callback para confirmar que el servidor recibió el evento
            console.log("Server acknowledged the update:", response);
        });
    };

    return (
        <div className="space-y-5">
            {/* {gVar[selectedVar]} */}
            <input
                className="w-full p-3 border-gray-300 border rounded-2xl"
                type="number"
                placeholder="variable"
                value={inputVar} // Usar value en lugar de defaultValue para control completo
                onChange={(e) => setInputVar(Number(e.target.value))}
            />
            <button
                className="bg-black text-white hover:bg-[#FFFF44] hover:text-black font-bold px-10 py-3 text-xl cursor-pointer transition-colors rounded-2xl"
                onClick={handleUpdateClick}
            >
                actualizar
            </button>
        </div>
    );
}

export default InputVar;