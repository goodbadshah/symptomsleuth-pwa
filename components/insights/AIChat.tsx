"use client";

import { useEffect, useRef, useState } from "react";
import { useAIChat } from "@/hooks/useAIChat";
import { getSampleQuestionForWeek } from "@/content/aiSampleQuestions";
import { SeverityGlyph } from "@/utils/severityGlyphs";
import { useAppState } from "@/app/providers";
import { getISOWeek } from "date-fns";

interface Props {
  loggedDaysCount: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Severity word processor - wraps recognized severity words with inline glyph
// ──────────────────────────────────────────────────────────────────────────────

const SEVERITY_LEVELS: Record<string, number> = {
  Mild: 1,
  Medium: 2,
  Severe: 4,
  Extreme: 5,
};

function processResponseContent(text: string): React.ReactNode[] {
  const pattern = /\b(Mild|Medium|Severe|Extreme)\b/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const word = match[1];
    const level = SEVERITY_LEVELS[word] ?? 3;
    parts.push(
      <span
        key={match.index}
        style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
      >
        <SeverityGlyph value={level} size={11} />
        <span>{word}</span>
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

// ──────────────────────────────────────────────────────────────────────────────
// Duration formatter for rate limit countdown
// ──────────────────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Chip component - double-bezel, tap-to-send
// ──────────────────────────────────────────────────────────────────────────────

function PromptChip({
  label,
  onSend,
  disabled,
}: {
  label: string;
  onSend: (q: string) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => onSend(label)}
      disabled={disabled}
      className="active:scale-[0.98] shrink-0"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 12px",
        borderRadius: "1.25rem",
        boxShadow: "0 0 0 1px var(--bezel-ring)",
        backgroundColor: "var(--bezel-outer-bg)",
        cursor: "pointer",
        border: "none",
        transition: "transform 150ms cubic-bezier(0.16,1,0.3,1), opacity 150ms",
        opacity: disabled ? 0.5 : 1,
        maxWidth: 220,
        textAlign: "left",
      }}
    >
      <span
        style={{
          display: "block",
          backgroundColor: "var(--bg-surface)",
          boxShadow: "var(--bezel-inset-shadow)",
          borderRadius: "calc(1.25rem - 0.375rem)",
          padding: "4px 10px",
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          color: "var(--text-secondary)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </span>
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────

export default function AIChat({ loggedDaysCount }: Props) {
  const { state } = useAppState();
  const condition = state.profile.conditions[0] ?? "Other";
  const weekNumber = getISOWeek(new Date());

  const { messages, isStreaming, error, rateLimitResetAt, sendMessage, clearConversation } =
    useAIChat();

  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());
  const conversationRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showFakeCursor = inputValue === "" && !isFocused && !isStreaming;

  // Tick for rate-limit countdown
  useEffect(() => {
    if (!rateLimitResetAt) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [rateLimitResetAt]);

  // Auto-scroll conversation to bottom on each new message
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-grow textarea
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    // Max 4 lines ≈ 4 * 24px line-height + padding
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  async function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming) return;
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await sendMessage(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Three rotating starter questions
  const starterChips = [0, 1, 2].map((offset) =>
    getSampleQuestionForWeek(condition, weekNumber + offset)
  );

  // Placeholder is static
  const isRateLimited = !!rateLimitResetAt;

  return (
    <>
      {/* Streaming caret + error animations */}
      <style>{`
        @keyframes blink-caret {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .streaming-caret::after {
          content: '▍';
          display: inline-block;
          animation: blink-caret 1s step-start infinite;
          color: var(--accent);
          font-size: 0.85em;
          margin-left: 1px;
        }
        @keyframes blink-input-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .input-fake-cursor {
          animation: blink-input-cursor 1s step-start infinite;
        }
      `}</style>

      {/* Card */}
      <div
        className="rounded-[1.25rem] p-6 flex flex-col"
        style={{
          backgroundColor: "var(--bg-surface)",
          boxShadow: "0 0 0 1px var(--bezel-ring)",
          gap: 16,
        }}
      >
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Eyebrow pill - accent variant */}
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5"
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                backgroundColor: "var(--accent-light)",
                color: "var(--accent)",
              }}
            >
              SLEUTH
            </span>

            {/* New conversation button */}
            <button
              onClick={clearConversation}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                color: "var(--text-secondary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              New conversation
            </button>
          </div>

          {/* Conversation area */}
          {messages.length === 0 ? (
            /* Empty state */
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "22px",
                  fontWeight: 400,
                  color: "var(--text-primary)",
                  margin: 0,
                  lineHeight: 1.35,
                }}
              >
                Chat with Sleuth.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Ask about your patterns, triggers, or symptoms. Sleuth reads your{" "}
                {loggedDaysCount} days of data - never your notes field unless
                you ask.
              </p>

              {/* Starter chips */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {starterChips.map((q, i) => (
                  <PromptChip
                    key={i}
                    label={q}
                    onSend={sendMessage}
                    disabled={isRateLimited}
                  />
                ))}
              </div>

              {/* Footnote */}
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Sleuth is not a doctor. For medical decisions, use the Doctor
                Report and see your clinician.
              </p>
            </div>
          ) : (
            /* Conversation */
            <div
              ref={conversationRef}
              style={{
                maxHeight: 480,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {msg.role === "assistant" && (
                    /* Accent dot */
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "var(--accent)",
                        display: "inline-block",
                        marginRight: 8,
                        marginTop: 5,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <p
                    className={
                      msg.role === "assistant" && isStreaming && msg.content === ""
                        ? "streaming-caret"
                        : msg.role === "assistant" &&
                          isStreaming &&
                          messages[messages.length - 1]?.id === msg.id
                        ? "streaming-caret"
                        : ""
                    }
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "15px",
                      color: "var(--text-primary)",
                      margin: 0,
                      lineHeight: 1.55,
                      paddingLeft: msg.role === "user" ? 48 : 0,
                      maxWidth: "100%",
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.role === "assistant"
                      ? processResponseContent(msg.content)
                      : msg.content}
                  </p>
                </div>
              ))}

              {/* Inline error */}
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "#C8472F",
                      margin: 0,
                    }}
                  >
                    {error}
                  </p>
                  <button
                    onClick={() => {
                      const lastUserMsg = [...messages]
                        .reverse()
                        .find((m) => m.role === "user");
                      if (lastUserMsg) sendMessage(lastUserMsg.content);
                    }}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "var(--accent)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Input area */}
          {isRateLimited ? (
            /* Rate limit message */
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                You&apos;ve asked 20 questions in the last day. Sleuth resets in{" "}
                {formatDuration(rateLimitResetAt!.getTime() - now)}.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Textarea - flat single-stroke input */}
              <div
                style={{
                  position: "relative",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  backgroundColor: "var(--bg-surface)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "10px 10px 10px 14px",
                  gap: 8,
                }}
              >
                {/* Blinking cursor shown when input is empty and unfocused */}
                {showFakeCursor && (
                  <span
                    className="input-fake-cursor"
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 14,
                      top: 13,
                      width: 1.5,
                      height: 18,
                      backgroundColor: "var(--accent)",
                      borderRadius: 1,
                      pointerEvents: "none",
                    }}
                  />
                )}
                <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Chat with Sleuth"
                    rows={1}
                    style={{
                      flex: 1,
                      resize: "none",
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      color: "var(--text-primary)",
                      lineHeight: 1.5,
                      minHeight: 24,
                      maxHeight: 96,
                      overflowY: "auto",
                      caretColor: "var(--accent)",
                      paddingLeft: showFakeCursor ? "12px" : 0,
                    }}
                    disabled={isStreaming}
                    aria-label="Ask Sleuth about your patterns"
                  />

                  {/* Send button - button-in-button */}
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isStreaming}
                    className="active:scale-[0.98] shrink-0"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: "var(--accent)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: inputValue.trim() && !isStreaming ? "pointer" : "not-allowed",
                      opacity: inputValue.trim() && !isStreaming ? 1 : 0.45,
                      transition:
                        "opacity 150ms cubic-bezier(0.16,1,0.3,1), transform 150ms cubic-bezier(0.16,1,0.3,1)",
                      flexShrink: 0,
                    }}
                    aria-label="Send message"
                  >
                    {/* Arrow up SVG */}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 11V3M7 3L3.5 6.5M7 3L10.5 6.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
              </div>
            </div>
          )}
        </div>
    </>
  );
}
