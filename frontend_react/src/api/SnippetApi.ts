import api from "@/lib/axios";
import { isAxiosError } from "axios";
import { SnippetFormData } from "@/types/index";

// type general
type SnippetAPIType = {
  formData: SnippetFormData,
  // si tuviera id de relacion con otra coleccion
  //   projectId: Project['_id']
};

// este codigo es por si tengo un type genral y quiero agregar solo ciertas cosas
// export async function createSnippet(
//   formData: Pick<SnippetAPIType, "formData">
// ) {
export async function createSnippet(formData: SnippetFormData) {
  try {
    const { data } = await api.post("/snippets", formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}
