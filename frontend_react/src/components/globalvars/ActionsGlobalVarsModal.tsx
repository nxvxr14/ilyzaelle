import { Socket } from "socket.io-client";
import { toast } from "react-toastify";

type UseGlobalVarActionsModalProps = {
  socket: Socket | null;
  projectId: string;
  serverAPIKey?: string;
};

export const useGlobalVarActionsModal = ({
  socket,
  projectId,
  serverAPIKey,
}: UseGlobalVarActionsModalProps) => {
  const handleDelete = (key: string) => {
    if (socket) {
      // Ahora pasamos el serverAPIKey para asegurar que el evento vaya solo al servidor correcto
      socket.emit("request-gVariable-delete-f-b", projectId, key, serverAPIKey);
      toast.success(`Variable ${key} reiniciada correctamente.`);
    } else {
      toast.error("No hay conexión con el servidor.");
    }
  };

  const handleUpdateVariable = (selectedVar: string, inputVar: any) => {
    if (socket) {
      // Incluimos el serverAPIKey en cada emisión de socket
      socket.emit(
        "request-gVariable-change-f-b",
        selectedVar,
        inputVar,
        projectId,
        serverAPIKey
      );
    } else {
      toast.error("No hay conexión con el servidor.");
    }
  };

  const handleInitializeVariable = (nameGlobalVar: string, initialValue: any) => {
    if (socket) {
      // Incluimos el serverAPIKey en la inicialización
      socket.emit(
        "request-gVarriable-initialize-f-b",
        projectId,
        nameGlobalVar,
        initialValue,
        serverAPIKey
      );
    } else {
      toast.error("No hay conexión con el servidor.");
    }
  };

  return {
    handleDelete,
    handleUpdateVariable,
    handleInitializeVariable,
  };
};