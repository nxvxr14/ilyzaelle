import { api } from "@/lib/axios";
import { isAxiosError } from "axios";
import {
  Project,
  DataVarFormData,
} from "../types";

type DataVarAPIType = {
  projectId: Project["_id"];
  finalFormData: DataVarFormData
};

export async function createDataVar({
  finalFormData,
  projectId,
}: Pick<DataVarAPIType, "finalFormData" | "projectId">) {
  try {
    const { data } = await api.post(`/projects/${projectId}/datavars`, finalFormData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}

// // se usa para obtener la data y enviarla al formulario
// export async function getBoardById({
//   projectId,
//   boardId,
// }: Pick<BoardAPIType, "projectId" | "boardId">) {
//   try {
//     const url = `/projects/${projectId}/boards/${boardId}/`;
//     const { data } = await api.get(url);
//     // esto sirve para tener autocompletado al llevar la informacion a BoardDetailsModal
//     // es bueno hacerlo para saber que el modelo del Schema concuerda con la informacion que se esta recibiendo de la api
//     const response = boardSchema.safeParse(data);
//     if (response.success) return response.data;
//   } catch (error) {
//     if (isAxiosError(error) && error.response) {
//       throw new Error(error.response.data.error);
//     }
//   }
// }


// export async function deleteBoardById({
//   projectId,
//   boardId,
// }: Pick<BoardAPIType, "projectId" | "boardId">) {
//   try {
//     const url = `/projects/${projectId}/boards/${boardId}/`;
//     // se pone el string para que cuando retorne data ts no lo tome como un any
//     const { data } = await api.delete<string>(url);
//     return data;
//   } catch (error) {
//     if (isAxiosError(error) && error.response) {
//       throw new Error(error.response.data.error);
//     }
//   }
// }

