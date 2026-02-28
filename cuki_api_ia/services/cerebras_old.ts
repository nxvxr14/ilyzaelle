import Cerebras from '@cerebras/cerebras_cloud_sdk';
import type { ChatMessage, IAService } from '../types';

const cerebras = new Cerebras();

export const cerebrasService: IAService = {
  name: "Cerebras",
  async chat(messages: ChatMessage[]) {
    const chatCompletion= await cerebras.chat.completions.create({
        messages: messages as any,
        model: 'zai-glm-4.7',
        stream: true,
        max_completion_tokens: 65000,
        temperature: 1,
        top_p: 0.95
    });

    // debo arreglar el type de chunk y de messages para que no sean any

    return (async function* () {
    for await (const chunk of chatCompletion) {
      yield (chunk as any).choices[0]?.delta?.content || "";
    }
  }());

    } 
}; 
