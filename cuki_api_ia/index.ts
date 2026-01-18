import { groqService } from "./services/groq";
import type {IAService, ChatMessage} from './types';

const services: IAService[] = [
    groqService
];

let currentServiceIndex = 0;

function getNextService() {
    const service = services[currentServiceIndex];
    currentServiceIndex = (currentServiceIndex + 1) % services.length;
    return service;
}

const server = Bun.serve({
    port: process.env.PORT ?? 3001,
    async fetch(req) {
        const {pathname} = new URL(req.url);

        if(req.method === "POST" && pathname === "/chat") {
            const {messages} = await req.json() as {messages: ChatMessage[]};

            const service = getNextService();

            console.log(`Using IA Service: ${service?.name}`);

            const stream = await service?.chat(messages);

            return new Response(stream, {
                headers: {
                    'content-type': 'text/event-stream',
                    'cache-control': 'no-cache',
                    'connection': 'keep-alive',
                },
            });

        }

        return new Response("Not found", {status: 404}) ;
    },
});


console.log(`Cuki API IA is running on port ${server.port}`);