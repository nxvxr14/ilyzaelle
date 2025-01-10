import { SocketContext } from "@/context/SocketContext";
import { useContext, useEffect, useState } from "react";
import { useGlobalVarActions } from "./ActionsGlobalVars";

interface GlobalVarListProps {
  projectId: string;
}

function GlobalVarList({ projectId }: GlobalVarListProps) {
  const { socket } = useContext(SocketContext);
  const [gVarData, setGVarData] = useState<any>(null);
  const { handleSave, handleDelete } = useGlobalVarActions({ socket, projectId });

  useEffect(() => {
    if (socket) {
      const interval = setInterval(() => {
        socket.emit("projectid-dashboard", projectId);
        console.log("timer")
      }, 2000);

      return () => {
        console.log("desmontando timer");
        clearInterval(interval);
      };
    }
  }, [socket, projectId]);

  useEffect(() => {
    if (socket) {
      const handleUpdateGVar = (gVarData: object) => {
        setGVarData(gVarData);
      };

      socket.on("update-gVar", handleUpdateGVar);

      return () => {
        console.log("Desmontando listener");
        socket.off("update-gVar", handleUpdateGVar);
      };
    }
  }, [socket]);

  const getFormattedValue = (value: any) => {
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (Array.isArray(value)) {
      return value[value.length - 1];
    }
    return value;
  };

  if (!gVarData) return (
    <div className="w-full p-4 text-center text-gray-500">vacio...</div>
  )

  return (
    <div className="w-full overflow-x-auto shadow-md rounded-lg">
      {gVarData && (
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre Variable
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo Variable
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Actual
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.keys(gVarData).map((key) => (
              <tr key={key} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {key}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {typeof gVarData[key]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getFormattedValue(gVarData[key])}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => handleSave(key)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors duration-200"
                    >
                      <span className="text-orange-600 font-semibold">G</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(key)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-colors duration-200"
                    >
                      <span className="text-red-600 font-semibold">X</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GlobalVarList;