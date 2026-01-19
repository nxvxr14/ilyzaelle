import { api } from "@/lib/axios";
import axios, { isAxiosError } from "axios";
import { Project, ProjectFormData, dashboardProjectSchema } from "../types";

// solo las peticiones de tipo get pasan por zod, las demas por ts
type ProjectAPIType = {
  formData: ProjectFormData;
  projectId: Project["_id"];
};

type ProjectStatusAPIType = {
  projectId: Project["_id"];
  status: Project["status"];
};

export async function createProject(formData: ProjectFormData) {
  try {
    const { data } = await api.post("/projects", formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}

export async function getProjects() {
  try {
    const { data } = await api.get("/projects");
    const response = dashboardProjectSchema.safeParse(data);
    if (response.success) return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}

export async function getProjectById(id: Project["_id"]) {
  try {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}

export async function updateProjectById({
  formData,
  projectId,
}: ProjectAPIType) {
  try {
    const { data } = await api.put<string>(`projects/${projectId}`, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}

export async function updateProjectStatusBydIdserver({
  projectId,
  status,
}: ProjectStatusAPIType) {
  try {
    const { data } = await api.post(`/projects/${projectId}/status`, {
      status,
    });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}

export async function deleteProjectById(id: Project["_id"]) {
  try {
    const { data } = await api.delete<string>(`/projects/${id}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}

/* backend local */
export async function getStatusLocal(server: string) {
  try {
    const url = `http://${server}/api/polling/statusLocal`;
    // como envio un solo string lo debo enviar como objeto
    // esto pasa porque unicamente envio un string, entonces la api no conoce la clave de ese string, por eso se envia como objeto
    const { data } = await axios.get(url);
    return data.message;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}

/* AIDash - Dashboard generado por IA */
type AIDashAPIType = {
  projectId: Project["_id"];
  AIDash: string;
};

export async function updateAIDash({ projectId, AIDash }: AIDashAPIType) {
  try {
    const { data } = await api.post(`/projects/${projectId}/aidash`, { AIDash });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}

export async function getAIDash(projectId: Project["_id"]) {
  try {
    const { data } = await api.get(`/projects/${projectId}/aidash`);
    return data; // Ahora retorna { AIDash, AIDashCode }
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}

// Guardar AIDash y generar/obtener codigo unico
export async function updateAIDashWithCode({ projectId, AIDash }: AIDashAPIType) {
  try {
    const { data } = await api.post(`/projects/${projectId}/aidash-with-code`, { AIDash });
    return data; // Retorna { message, AIDashCode }
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}

// Obtener dashboard publico por codigo (sin autenticacion)
export async function getAIDashByCode(dashCode: string) {
  try {
    const { data } = await api.get(`/public/dashboard/${dashCode}`);
    return data; // { AIDash, projectName }
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}

/* AI Chat History */
export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export async function getAIChatHistory(projectId: Project["_id"]) {
  try {
    const { data } = await api.get(`/projects/${projectId}/ai-chat-history`);
    return data.AIChatHistory as AIChatMessage[];
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}

export async function addAIChatMessage(projectId: Project["_id"], message: AIChatMessage) {
  try {
    const { data } = await api.post(`/projects/${projectId}/ai-chat-history`, message);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}

export async function addAIChatMessages(projectId: Project["_id"], messages: AIChatMessage[]) {
  try {
    const { data } = await api.post(`/projects/${projectId}/ai-chat-history/bulk`, { messages });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}

export async function clearAIChatHistory(projectId: Project["_id"]) {
  try {
    const { data } = await api.delete(`/projects/${projectId}/ai-chat-history`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response)
      throw new Error(error.response.data.error);
  }
}
