import { api } from "@/lib/axios";
import { isAxiosError } from "axios";
import { Project, DataVar, dataVarSchema, DataVarFormData } from "../types";

type DataVarAPIType = {
  projectId: Project["_id"];
  finalFormData: DataVarFormData;
  dataVarId: DataVar["_id"];
};

export async function createDataVar({
  finalFormData,
  projectId,
}: Pick<DataVarAPIType, "finalFormData" | "projectId">) {
  try {
    const { data } = await api.post(
      `/projects/${projectId}/datavars`,
      finalFormData
    );
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}

export async function deleteDataVar({
  projectId,
  dataVarId,
}: Pick<DataVarAPIType, "projectId" | "dataVarId">) {
  try {
    const url = `/projects/${projectId}/datavars/${dataVarId}`;
    console.log(url);
    const { data } = await api.delete(url);
    // esto sirve para tener autocompletado al llevar la informacion a BoardDetailsModal
    // es bueno hacerlo para saber que el modelo del Schema concuerda con la informacion que se esta recibiendo de la api
    const response = dataVarSchema.safeParse(data);
    if (response.success) return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}

