import Cerebras from '@cerebras/cerebras_cloud_sdk';
import type { ChatMessage, IAService } from '../types';

const cerebras = new Cerebras();

export const cerebrasService: IAService = {
  name: "Cerebras",
  async chat(messages: ChatMessage[]) {
    const stream = await cerebras.chat.completions.create({
      messages,
      model: 'gpt-oss-120b',
      stream: true,
      max_completion_tokens: 32768,
      temperature: 1,
      top_p: 1,
      reasoning_effort: "high",
    } as Parameters<typeof cerebras.chat.completions.create>[0]);

    return (async function* () {
      for await (const chunk of stream) {
        yield chunk.choices[0]?.delta?.content || '';
      }
    }());
  },
};
