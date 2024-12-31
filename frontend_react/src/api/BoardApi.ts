import api from "@/lib/axios";
import { isAxiosError } from "axios";
import { Board, BoardFormData, Project } from "../types";

type BoardAPIType = {
  projectId: Project["_id"];
  boardId: Board["_id"];
  formData: BoardFormData;
  boardCode: string;
};

export async function createboard({
  formData,
  projectId,
}: Pick<BoardAPIType, "formData" | "projectId">) {
  try {
    const { data } = await api.post(`/projects/${projectId}/boards`, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}

// se usa para obtener la data y enviarla al formulario
export async function getBoardById({
  projectId,
  boardId,
}: Pick<BoardAPIType, "projectId" | "boardId">) {
  try {
    const url = `/projects/${projectId}/boards/${boardId}/`;
    const { data } = await api.get(url);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}

export async function updateBoardById({
  projectId,
  boardId,
  formData,
}: Pick<BoardAPIType, "projectId" | "boardId" | "formData">) {
  try {
    const url = `/projects/${projectId}/boards/${boardId}/`;
    const { data } = await api.put<string>(url, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}

export async function updateCodeBoardById({
  projectId,
  boardId,
  boardCode,
}: Pick<BoardAPIType, "projectId" | "boardId" | "boardCode">) {
  try {
    const url = `/projects/${projectId}/boards/${boardId}/code`;
    // como envio un solo string lo debo enviar como objeto
    // esto pasa porque unicamente envio un string, entonces la api no conoce la clave de ese string, por eso se envia como objeto
    const { data } = await api.post(url, {boardCode});
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}

export async function deleteBoardById({
  projectId,
  boardId,
}: Pick<BoardAPIType, "projectId" | "boardId">) {
  try {
    const url = `/projects/${projectId}/boards/${boardId}/`;
    // se pone el string para que cuando retorne data ts no lo tome como un any
    const { data } = await api.delete<string>(url);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}
