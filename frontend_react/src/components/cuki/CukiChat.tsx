import { useState, useRef, useCallback, useEffect } from "react";
import CukiMessage from "@/components/cuki/CukiMessage";

const CUKI_IA_API = import.meta.env.VITE_CUKI_IA_API;

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

/** Estimate token count for a string (average of char-based and word-based heuristics). */
function estimateTokens(text: string): number {
  const charBased = Math.ceil(text.length / 4);
  const words = text.split(/\s+/).length;
  const wordBased = Math.ceil(words * 1.3);
  return Math.ceil((charBased + wordBased) / 2);
}

/** Sum estimated tokens across an array of messages (+4 overhead per message). */
function calculateTotalTokens(messages: { role: string; content: string }[]): number {
  return messages.reduce((total, msg) => total + estimateTokens(msg.content) + 4, 0);
}

type CukiChatProps = {
  /** Build the system prompt for the AI. Called on every send. */
  getSystemPrompt: () => string;
  /** Called with the full AI response text after streaming completes. */
  onAIResponse?: (fullText: string) => void;
  /** Placeholder text for the textarea. */
  placeholder?: string;
  /** Title shown in the empty state. */
  emptyTitle?: string;
  /** Description shown in the empty state. */
  emptyDescription?: string;
  /** Extra content to render in the input bar (e.g. GVarPopup button). Rendered before the textarea. */
  inputBarExtra?: React.ReactNode;
  /** The chat container ref (for external scroll control, e.g. keyboard resize). */
  chatContainerRef?: React.RefObject<HTMLDivElement>;
  /** When true, the input is disabled and shows a message. Used during diff review. */
  disabled?: boolean;
  /** Message shown when disabled (e.g. "Revisa los cambios propuestos..."). */
  disabledMessage?: string;
  /** A note injected into the next user message context (e.g. rejection info). Consumed once after send. */
  contextNote?: string | null;
  /** Called after contextNote is consumed, so the parent can clear it. */
  onContextNoteConsumed?: () => void;
  /** Initial messages loaded from backend (for persistence). */
  initialMessages?: ChatMessage[];
  /** Called with the full messages array after each user+assistant exchange completes. */
  onMessagesChange?: (messages: ChatMessage[]) => void;
  /** Called when the user clears chat history. */
  onClearHistory?: () => void;
};

export default function CukiChat({
  getSystemPrompt,
  onAIResponse,
  placeholder = "Escribe un mensaje...",
  emptyTitle = "Cuki",
  emptyDescription = "Asistente IA",
  inputBarExtra,
  chatContainerRef: externalChatRef,
  disabled = false,
  disabledMessage,
  contextNote,
  onContextNoteConsumed,
  initialMessages,
  onMessagesChange,
  onClearHistory,
}: CukiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState("");
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const internalChatRef = useRef<HTMLDivElement>(null);
  const chatRef = externalChatRef ?? internalChatRef;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const retryFlagRef = useRef(false);

  // Load initial messages from backend (once)
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, streamingText, chatRef]);

  // Build message context for the API
  // Context: system prompt → antepenultimate user message → last assistant message → current user message
  const buildContext = (userContent: string): { role: string; content: string }[] => {
    const system = { role: 'system', content: getSystemPrompt() };
    const context: { role: string; content: string }[] = [system];

    // Find the antepenultimate user message (user_n-2) and the last assistant message (assistant_n-1)
    // Walk backwards through messages to find: last assistant, then the user message before that
    let lastAssistant: ChatMessage | null = null;
    let prevUser: ChatMessage | null = null;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (!lastAssistant && messages[i].role === 'assistant') {
        lastAssistant = messages[i];
      } else if (lastAssistant && !prevUser && messages[i].role === 'user') {
        prevUser = messages[i];
        break;
      }
    }

    if (prevUser) context.push({ role: 'user', content: prevUser.content });
    if (lastAssistant) context.push({ role: 'assistant', content: lastAssistant.content });

    // If there is a contextNote (e.g. rejection info), prepend it to the user message
    const finalUserContent = contextNote
      ? `[NOTA DEL SISTEMA: ${contextNote}]\n\n${userContent}`
      : userContent;
    context.push({ role: 'user', content: finalUserContent });

    // Consume the context note after use
    onContextNoteConsumed?.();

    return context;
  };

  const handleSend = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError("");
    setStreamingText("");
    setFailedMessage(null);

    const userMessage: ChatMessage = { role: 'user', content: prompt };
    const currentPrompt = prompt;
    setPrompt("");
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setMessages(prev => [...prev, userMessage]);

    const contextMessages = buildContext(currentPrompt);

    // Debug: log context and token estimates
    const totalInputTokens = calculateTotalTokens(contextMessages);
    console.group('%c[CukiChat] Enviando mensaje a la API', 'color: #9333ea; font-weight: bold; font-size: 14px;');
    console.log('%cMensajes enviados:', 'color: #6366f1; font-weight: bold;');
    contextMessages.forEach((msg, index) => {
      const tokenCount = estimateTokens(msg.content) + 4;
      console.log(`  [${index + 1}] ${msg.role.toUpperCase()} (~${tokenCount} tokens):`);
      if (msg.role === 'system') {
        // Show system prompt summary including embedded code length
        const codeMatch = msg.content.match(/```javascript\n([\s\S]*?)```/);
        const codeLen = codeMatch ? codeMatch[1].trim().length : 0;
        console.log(`      (System prompt - ${msg.content.length} chars, codigo embebido: ${codeLen} chars)`);
      } else {
        console.log(`      "${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}"`);
      }
    });
    console.log('%cTotal mensajes:', 'color: #22c55e; font-weight: bold;', contextMessages.length);
    console.log('%cTokens estimados (entrada):', 'color: #f59e0b; font-weight: bold;', `~${totalInputTokens} tokens`);
    console.groupEnd();

    try {
      const response = await fetch(CUKI_IA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: contextMessages }),
      });

      if (!response.ok) {
        throw new Error('Error al comunicarse con la API de IA');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No se pudo obtener el lector del stream');
      }

      const decoder = new TextDecoder();
      let fullText = '';

      const readStream = async (): Promise<string> => {
        const { done, value } = await reader.read();
        if (done) return fullText;
        fullText += decoder.decode(value, { stream: true });
        setStreamingText(fullText);
        return readStream();
      };

      await readStream();

      // Guard: if AI returned empty response, treat as error
      if (!fullText.trim()) {
        throw new Error('La IA devolvio una respuesta vacia');
      }

      // Debug: log output tokens
      const outputTokens = estimateTokens(fullText);
      console.group('%c[CukiChat] Respuesta recibida', 'color: #22c55e; font-weight: bold; font-size: 14px;');
      console.log('%cTokens estimados (salida):', 'color: #f59e0b; font-weight: bold;', `~${outputTokens} tokens`);
      console.log('%cTotal tokens (entrada + salida):', 'color: #ef4444; font-weight: bold;', `~${totalInputTokens + outputTokens} tokens`);
      console.groupEnd();

      const assistantMessage: ChatMessage = { role: 'assistant', content: fullText };
      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        // Notify parent with updated messages for persistence
        onMessagesChange?.(updated);
        return updated;
      });
      setStreamingText("");

      onAIResponse?.(fullText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setFailedMessage(currentPrompt);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    if (!failedMessage) return;
    // Remove the failed user message from the list
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'user' && last.content === failedMessage) {
        return prev.slice(0, -1);
      }
      return prev;
    });
    const retryPrompt = failedMessage;
    setFailedMessage(null);
    setError("");
    setPrompt(retryPrompt);
    retryFlagRef.current = true;
  };

  // Auto-send on retry
  useEffect(() => {
    if (retryFlagRef.current && prompt.trim() && !isGenerating) {
      retryFlagRef.current = false;
      handleSend();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    if (messages.length === 0) return;
    if (confirm("Iniciar nuevo chat? Se eliminara el historial actual.")) {
      setMessages([]);
      setStreamingText("");
      setError("");
      setFailedMessage(null);
      initializedRef.current = false;
      onClearHistory?.();
    }
  };

  // Auto-resize textarea (max 7 lines)
  const autoResizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const lineHeight = 20;
    const maxHeight = lineHeight * 7 + 24;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 bg-[#1a1625] border-b border-gray-800">
        <h2 className="text-sm font-bold text-white">Cuki</h2>
        <button
          onClick={handleNewChat}
          disabled={messages.length === 0 || isGenerating}
          className={`text-xs px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
            messages.length === 0 || isGenerating
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-red-400 hover:text-red-300 hover:bg-[#2a2435] cursor-pointer'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
        </button>
      </div>

      {/* Messages area */}
      <div
        ref={chatRef as React.RefObject<HTMLDivElement>}
        className="flex-1 overflow-y-auto px-3 py-4 min-h-0"
      >
        <div className="space-y-4">
          {/* Empty state */}
          {messages.length === 0 && !isGenerating && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-3xl font-black text-purple-500 mb-2">{emptyTitle}</div>
              <p className="text-gray-500 text-xs max-w-xs">{emptyDescription}</p>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#1a1625] text-gray-200 border border-gray-800'
              }`}>
                <p className="text-xs font-semibold mb-0.5 opacity-70">
                  {msg.role === 'user' ? 'Tu' : 'Cuki'}
                </p>
                {msg.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                ) : (
                  <CukiMessage content={msg.content} />
                )}
              </div>
            </div>
          ))}

          {/* Error with retry */}
          {error && !isGenerating && (
            <div className="flex justify-end">
              <div className="max-w-[85%] space-y-2">
                <div className="p-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-xs">
                  {error}
                </div>
                {failedMessage && (
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-[#2a2435] cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reintentar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Streaming response */}
          {streamingText && isGenerating && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-[#1a1625] text-gray-200 border border-gray-800">
                <p className="text-xs font-semibold mb-0.5 opacity-70">Cuki</p>
                <CukiMessage content={streamingText} />
              </div>
            </div>
          )}

          {/* Generating indicator */}
          {isGenerating && !streamingText && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-3 py-2 bg-[#1a1625] border border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-gray-800 bg-[#1a1625] px-3 py-2">
        {disabled && disabledMessage ? (
          <div className="text-xs text-gray-500 text-center py-2">{disabledMessage}</div>
        ) : (
        <div className="flex items-end gap-2">
          {inputBarExtra}

          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              autoResizeTextarea();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-[#120d18] text-white border border-gray-700 rounded-xl px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-600 min-h-[40px] overflow-y-auto"
            style={{ maxHeight: `${20 * 7 + 24}px` }}
            rows={1}
            disabled={isGenerating || disabled}
          />

          <button
            onClick={handleSend}
            disabled={isGenerating || !prompt.trim() || disabled}
            className={`p-2 rounded-xl transition-colors ${
              isGenerating || !prompt.trim() || disabled
                ? 'text-gray-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
