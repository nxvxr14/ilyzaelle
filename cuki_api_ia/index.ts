import { cerebrasService } from "./services/cerebras";
import { groqQwenService } from "./services/groq_qwen";
import { groqService } from "./services/groq";
import type { IAService, ChatMessage } from './types';

const services: IAService[] = [
  //groqQwenService,
  groqService,
  //cerebrasService,
];

let currentServiceIndex = 0;

function getNextService(): IAService {
  const service = services[currentServiceIndex]!;
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service;
}

/** Returns the other service as fallback (opposite of the one that failed) */
function getFallbackService(failedName: string): IAService | undefined {
  return services.find((s) => s.name !== failedName);
}

const server = Bun.serve({
  port: process.env.PORT ?? 3001,
  async fetch(req) {
    const { pathname } = new URL(req.url);

    if (req.method === "POST" && pathname === "/cukiAPI") {
      const { messages } = await req.json() as { messages: ChatMessage[] };

      const primary = getNextService();
      console.log(`Using IA Service: ${primary.name}`);

      try {
        const stream = await primary.chat(messages);
        return new Response(stream as unknown as BodyInit, {
          headers: {
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache',
            'connection': 'keep-alive',
          },
        });
      } catch (err) {
        console.error(`${primary.name} failed:`, err);

        const fallback = getFallbackService(primary.name);
        if (!fallback) {
          return new Response("All IA services unavailable", { status: 503 });
        }

        console.log(`Falling back to: ${fallback.name}`);
        try {
          const stream = await fallback.chat(messages);
          return new Response(stream as unknown as BodyInit, {
            headers: {
              'content-type': 'text/event-stream',
              'cache-control': 'no-cache',
              'connection': 'keep-alive',
            },
          });
        } catch (fallbackErr) {
          console.error(`${fallback.name} also failed:`, fallbackErr);
          return new Response("All IA services unavailable", { status: 503 });
        }
      }
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Cuki API IA is running on port ${server.port}`);
