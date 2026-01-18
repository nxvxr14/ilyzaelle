import { Groq } from "groq-sdk";
import type { ChatMessage, IAService } from "../types";

const groq = new Groq();

export const groqService: IAService = {
  name: "Groq",
  async chat(messages: ChatMessage[]) {
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "moonshotai/kimi-k2-instruct-0905",
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 1,
      stream: true,
      stop: null,
    });

    // el yield permite devolver una respuesta conforme va llegando para no dejar esperando al usuario
    // se envuelve el yield en una funcion asyncrona generadora function*, se llama generadora porque cada vez que tiene un trozo de la respuesta va realizadando el return, como un streaming de datos

    return (async function* () {
    for await (const chunk of chatCompletion) {
      yield (chunk.choices[0]?.delta?.content || "");
    }
  }());
  },
};
