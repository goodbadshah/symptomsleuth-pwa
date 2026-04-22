"use client";

import { useState, useRef, useCallback } from "react";
import { useAppState } from "@/app/providers";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface AIChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  rateLimitResetAt: Date | null;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
}

const MAX_MESSAGES_PER_DAY = 20;
const ROLLING_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * useAIChat - session-scoped chat state with rate limiting and streaming.
 *
 * Messages are React state only - never persisted to storage or server.
 * Rate limit enforced client-side via profile.aiUsage.messages[].
 */
export function useAIChat(): AIChatState {
  const { state, dispatch } = useAppState();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitResetAt, setRateLimitResetAt] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    setRateLimitResetAt(null);
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      // Rate limit check - prune messages older than 24h
      const cutoff = new Date(Date.now() - ROLLING_WINDOW_MS).toISOString();
      const recentUsage = (state.profile.aiUsage?.messages ?? []).filter(
        (m) => m.sentAt > cutoff
      );
      if (recentUsage.length >= MAX_MESSAGES_PER_DAY) {
        const oldest = new Date(recentUsage[0].sentAt);
        setRateLimitResetAt(new Date(oldest.getTime() + ROLLING_WINDOW_MS));
        return;
      }

      // Record usage
      const sentAt = new Date().toISOString();
      dispatch({ type: "RECORD_AI_MESSAGE", payload: { sentAt } });

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content,
      };
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      setError(null);

      abortRef.current = new AbortController();

      try {
        const recentLogs = state.logs.slice(-90);
        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            messages: [
              ...messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content },
            ],
            userContext: {
              conditions: state.profile.conditions,
              loggedDaysCount: new Set(state.logs.map((l) => l.date)).size,
              totalLogEntries: state.logs.reduce((s, l) => s + l.entries.length, 0),
              recentLogs,
            },
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No response body");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // SSE: each line is "data: <token>" or "data: [DONE]"
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") break;
            try {
              const parsed = JSON.parse(payload) as { token?: string; error?: string };
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.token) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + parsed.token,
                    };
                  }
                  return updated;
                });
              }
            } catch {
              // Non-JSON line - skip
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
        // Remove the empty assistant message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, messages, state, dispatch]
  );

  return {
    messages,
    isStreaming,
    error,
    rateLimitResetAt,
    sendMessage,
    clearConversation,
  };
}
