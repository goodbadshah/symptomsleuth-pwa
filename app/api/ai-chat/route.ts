import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildAISystemPrompt } from "@/utils/aiSystemPrompt";
import type { DailyLog } from "@/app/providers";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface UserContext {
  conditions: string[];
  loggedDaysCount: number;
  totalLogEntries: number;
  recentLogs: DailyLog[];
}

interface RequestBody {
  messages: ChatMessage[];
  userContext: UserContext;
}

// ──────────────────────────────────────────────────────────────────────────────
// Log serializer - compact text format, ~6000 tokens for 90-day payloads.
// Notes field is intentionally excluded for privacy.
// ──────────────────────────────────────────────────────────────────────────────

function formatLogs(logs: DailyLog[]): string {
  // Last 90 days only
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const recent = logs
    .filter((l) => l.date >= cutoffStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (recent.length === 0) return "(no recent logs)";

  return recent
    .map((log) => {
      const entries = log.entries
        .map((e) => {
          const severityLabel = ["None", "Mild", "Medium", "Severe", "Extreme"][
            Math.min(e.value, 4)
          ] ?? "Unknown";
          return `${e.symptomId}:${e.value}(${severityLabel})`;
        })
        .join(", ");

      const ctx = log.context;
      const contextParts: string[] = [];
      if (ctx?.sleepQuality != null)
        contextParts.push(`sleep:${ctx.sleepQuality}`);
      if (ctx?.stressLevel != null)
        contextParts.push(`stress:${ctx.stressLevel}`);
      if (ctx?.exercise != null)
        contextParts.push(`exercise:${ctx.exercise ? "yes" : "no"}`);
      if (ctx?.foodTriggers && ctx.foodTriggers.length > 0)
        contextParts.push(`triggers:[${ctx.foodTriggers.join(",")}]`);

      const contextStr =
        contextParts.length > 0 ? ` | ctx: ${contextParts.join(" ")}` : "";
      return `${log.date}: ${entries || "(no entries)"}${contextStr}`;
    })
    .join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/ai-chat
// Streaming SSE endpoint for AI Sleuth chat.
// ──────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  // ── Input validation ────────────────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, userContext } = body;

  if (
    !userContext ||
    typeof userContext.loggedDaysCount !== "number" ||
    typeof userContext.totalLogEntries !== "number"
  ) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Data threshold gate - server-side enforcement
  if (
    userContext.loggedDaysCount < 14 ||
    userContext.totalLogEntries < 20
  ) {
    return NextResponse.json(
      { error: "AI threshold not met" },
      { status: 403 }
    );
  }

  // Session length gate
  if (!Array.isArray(messages) || messages.length > 10) {
    return NextResponse.json(
      { error: "Conversation too long; start a new session" },
      { status: 400 }
    );
  }

  // Validate message shape - each must have role and string content
  for (const msg of messages) {
    if (
      !msg ||
      (msg.role !== "user" && msg.role !== "assistant") ||
      typeof msg.content !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 503 }
    );
  }

  // ── Build prompt ────────────────────────────────────────────────────────────
  const systemPrompt = buildAISystemPrompt({
    conditions: Array.isArray(userContext.conditions) ? userContext.conditions : [],
    loggedDaysCount: userContext.loggedDaysCount,
    totalLogEntries: userContext.totalLogEntries,
  });

  const logData = Array.isArray(userContext.recentLogs)
    ? formatLogs(userContext.recentLogs)
    : "(no logs provided)";

  // Take at most the last 10 turns
  const conversationMessages = messages.slice(-10) as Array<{
    role: "user" | "assistant";
    content: string;
  }>;

  // ── Stream via SSE ──────────────────────────────────────────────────────────
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      try {
        const client = new Anthropic({ apiKey });

        const anthropicStream = await client.messages.stream({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 800,
          system: [
            {
              type: "text",
              text: systemPrompt,
              cache_control: { type: "ephemeral" },
            },
            {
              type: "text",
              text: `User's recent symptom data:\n${logData}`,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: conversationMessages,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            sendEvent(JSON.stringify({ token: event.delta.text }));
          }
        }

        sendEvent("[DONE]");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unexpected error from AI service";
        sendEvent(JSON.stringify({ error: message }));
        sendEvent("[DONE]");
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
