// SocketContext.tsx
import { createContext, useContext, ReactNode, useState, useCallback, useRef, useEffect } from "react";
import { Socket } from "socket.io-client";
import { useSocket } from "@/hooks/useSocket"; // Asegúrate de importar el hook que hemos creado.

interface SocketContextType {
  socket: Socket | null;
  online: boolean;
  setServerAPI: (serverAPI: string) => void;
  serverAPI: string;
  // New methods for polling via socket
  pollingBoardsViaSocket: (pollingData: any) => Promise<PollingResponse>;
  pollingCodesViaSocket: (pollingDataCodes: any) => Promise<PollingResponse>;
  getStatusLocalViaSocket: () => Promise<StatusLocalResponse>;
}

// Types for polling responses
interface PollingResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface StatusLocalResponse {
  online: boolean;
  message?: string;
  error?: string;
}

// Type for pending requests
type PendingRequest<T> = {
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  timeout: NodeJS.Timeout;
};

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  online: false,
  setServerAPI: () => { },
  serverAPI: '',
  pollingBoardsViaSocket: async () => ({ success: false, error: "Not initialized" }),
  pollingCodesViaSocket: async () => ({ success: false, error: "Not initialized" }),
  getStatusLocalViaSocket: async () => ({ online: false, error: "Not initialized" }),
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [serverAPI, setServerAPI] = useState<string>('');
  const { socket, online } = useSocket(serverAPI);
  
  // Refs to store pending requests
  const pendingPollingBoards = useRef<Map<string, PendingRequest<PollingResponse>>>(new Map());
  const pendingPollingCodes = useRef<Map<string, PendingRequest<PollingResponse>>>(new Map());
  const pendingStatusLocal = useRef<Map<string, PendingRequest<StatusLocalResponse>>>(new Map());

  // Generate unique request ID
  const generateRequestId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Setup socket listeners for responses
  useEffect(() => {
    if (!socket) return;

    const handlePollingBoardsResponse = (data: PollingResponse, requestId: string) => {
      const pending = pendingPollingBoards.current.get(requestId);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingPollingBoards.current.delete(requestId);
        pending.resolve(data);
      }
    };

    const handlePollingCodesResponse = (data: PollingResponse, requestId: string) => {
      const pending = pendingPollingCodes.current.get(requestId);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingPollingCodes.current.delete(requestId);
        pending.resolve(data);
      }
    };

    const handleStatusLocalResponse = (data: StatusLocalResponse, requestId: string) => {
      const pending = pendingStatusLocal.current.get(requestId);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingStatusLocal.current.delete(requestId);
        pending.resolve(data);
      }
    };

    socket.on("response-polling-boards-b-f", handlePollingBoardsResponse);
    socket.on("response-polling-codes-b-f", handlePollingCodesResponse);
    socket.on("response-status-local-b-f", handleStatusLocalResponse);

    return () => {
      socket.off("response-polling-boards-b-f", handlePollingBoardsResponse);
      socket.off("response-polling-codes-b-f", handlePollingCodesResponse);
      socket.off("response-status-local-b-f", handleStatusLocalResponse);
    };
  }, [socket]);

  // Polling boards via socket
  const pollingBoardsViaSocket = useCallback((pollingData: any): Promise<PollingResponse> => {
    return new Promise((resolve, reject) => {
      if (!socket || !serverAPI) {
        resolve({ success: false, error: "Socket not connected" });
        return;
      }

      const requestId = generateRequestId();
      const timeout = setTimeout(() => {
        pendingPollingBoards.current.delete(requestId);
        resolve({ success: false, error: "Request timeout" });
      }, 10000); // 10 second timeout

      pendingPollingBoards.current.set(requestId, { resolve, reject, timeout });
      socket.emit("request-polling-boards-f-b", pollingData, serverAPI, requestId);
    });
  }, [socket, serverAPI]);

  // Polling codes via socket
  const pollingCodesViaSocket = useCallback((pollingDataCodes: any): Promise<PollingResponse> => {
    return new Promise((resolve, reject) => {
      if (!socket || !serverAPI) {
        resolve({ success: false, error: "Socket not connected" });
        return;
      }

      const requestId = generateRequestId();
      const timeout = setTimeout(() => {
        pendingPollingCodes.current.delete(requestId);
        resolve({ success: false, error: "Request timeout" });
      }, 10000);

      pendingPollingCodes.current.set(requestId, { resolve, reject, timeout });
      socket.emit("request-polling-codes-f-b", pollingDataCodes, serverAPI, requestId);
    });
  }, [socket, serverAPI]);

  // Get status local via socket
  const getStatusLocalViaSocket = useCallback((): Promise<StatusLocalResponse> => {
    return new Promise((resolve, reject) => {
      if (!socket || !serverAPI) {
        resolve({ online: false, error: "Socket not connected" });
        return;
      }

      const requestId = generateRequestId();
      const timeout = setTimeout(() => {
        pendingStatusLocal.current.delete(requestId);
        resolve({ online: false, error: "Request timeout" });
      }, 5000); // 5 second timeout

      pendingStatusLocal.current.set(requestId, { resolve, reject, timeout });
      socket.emit("request-status-local-f-b", serverAPI, requestId);
    });
  }, [socket, serverAPI]);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      online, 
      setServerAPI, 
      serverAPI,
      pollingBoardsViaSocket,
      pollingCodesViaSocket,
      getStatusLocalViaSocket
    }}>
      {children}
    </SocketContext.Provider>
  );
};

// para acceder al contexto desde cualquier lugar de la aplicación
// export const useSocketContext = () => useContext(SocketContext);
