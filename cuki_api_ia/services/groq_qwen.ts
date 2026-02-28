import { Groq } from "groq-sdk";
import type { ChatMessage, IAService } from "../types";

const groq = new Groq();

export const groqQwenService: IAService = {
  name: "Groq Qwen",
  async chat(messages: ChatMessage[]) {
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "qwen/qwen3-32b",
      temperature: 0.6,
      max_completion_tokens: 30000,
      top_p: 0.95,
      stream: true,
      reasoning_effort: "default",
      stop: null,
    } as Parameters<typeof groq.chat.completions.create>[0]);

    // el yield permite devolver una respuesta conforme va llegando para no dejar esperando al usuario
    // se envuelve el yield en una funcion asyncrona generadora function*, se llama generadora porque cada vez que tiene un trozo de la respuesta va realizadando el return, como un streaming de datos

    return (async function* () {
      for await (const chunk of chatCompletion) {
        yield chunk.choices[0]?.delta?.content || "";
      }
    }());
  },
};
