import { SocketContext } from '@/context/SocketContext';
import { useParams } from 'react-router-dom';
import { useContext } from 'react';

type varProps = {
    selectedVar: string;
    gVar: any;
    serverAPIKey?: string; // Añadir prop para serverAPIKey
};

function Toggle({ selectedVar, gVar, serverAPIKey }: varProps) {
    const params = useParams();
    const projectId = params.projectId!;
    const { socket } = useContext(SocketContext);
    
    // Important: Get the current value directly from gVar at render time
    const isOn = Boolean(gVar[selectedVar]);
    
    // Function to handle toggle - using the correct f-b event
    const handleToggle = () => {
        // Use the f-b socket event, not b-b
        if (socket) {
            // Send the opposite of current value and include serverAPIKey
            socket.emit("request-gVariable-change-f-b", selectedVar, !isOn, projectId, serverAPIKey, (response: any) => {
                // Callback to confirm server received the event
                console.log("Server acknowledged toggle update:", response);
            });
            
            // Add console.log for debugging
            console.log(`Toggle pressed: Sending value change for ${selectedVar} from ${isOn} to ${!isOn} with serverAPIKey: ${serverAPIKey}`);
        }
    };
    
    return (
        <div className="flex flex-col p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
                <span className="text-white text-lg font-medium">
                    {selectedVar}
                </span>
                
                <button
                    onClick={handleToggle}
                    className={`w-16 h-8 rounded-full flex items-center transition-all duration-300 focus:outline-none shadow ${
                        isOn ? 'bg-[#FFFF44] justify-end' : 'bg-gray-600 justify-start'
                    }`}
                >
                    <span className={`bg-white w-6 h-6 rounded-full shadow-lg transform mx-1`} />
                </button>
            </div>
            
            <div className="mt-2 text-sm text-gray-400">
                {isOn ? "true" : "false"}
            </div>
        </div>
    );
}

export default Toggle;
