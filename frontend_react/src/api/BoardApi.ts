import api from "@/lib/axios";
import { isAxiosError } from "axios";
import { BoardFormData, Project } from "../types";

type BoardAPIType = {
  formData: BoardFormData;
  projectId: Project["_id"];
};

export async function createboard({ formData, projectId }: BoardAPIType) {
  try {
    const { data } = await api.post(`/projects/${projectId}/boards`, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}
