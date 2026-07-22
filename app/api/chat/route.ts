import { NextRequest, NextResponse } from "next/server";
import { getCourses } from "@/lib/data/courses";
import { APP_TIMEZONE } from "@/lib/dates";
import { GeminiApiError, generateContent, type GeminiContent, type GeminiPart } from "@/lib/agent/gemini";
import { runTool, TOOL_DECLARATIONS } from "@/lib/agent/tools";

export const runtime = "nodejs";

const MAX_TOOL_ROUNDS = 6;
const MAX_HISTORY_MESSAGES = 20;

interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

function buildSystemInstruction(courseCodes: string[]): string {
  const nowFormatter = new Intl.DateTimeFormat("en-AU", {
    timeZone: APP_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const now = new Date();
  const nowLabel = nowFormatter.format(now);
  const nowIso = now.toISOString();

  return `You are the AI assistant built into "Sem 2 Deadlines", a personal deadline tracker for a UTAS student's Semester 2 2026 courses (${courseCodes.join(", ") || "no courses seeded yet"}).

Current date/time: ${nowLabel} (Australia/Hobart timezone), ISO instant: ${nowIso}. Always reason about "today", "this week", "overdue", etc. relative to this exact moment - never guess or assume a different date.

Rules:
- For ANY question about deadlines, due dates, rubrics, weights, status, or course outlines/schedules, you MUST call the relevant tool to get real data before answering. Never invent or guess dates, weights, or rubric content - these are real assessments that affect a real grade.
- If a tool result is ambiguous (multiple candidates) or empty, ask a brief clarifying question or say plainly that nothing matched - don't fabricate an answer.
- Always cite the exact course code and, where relevant, the exact due date/time (Australia/Hobart) in your answer, e.g. "KIT519 - SDLC Quiz (Quiz 1), due Thu 23 Jul 2026, 2:30pm".
- Only call markDeadlineStatus when the user clearly asks to mark something done/undone/complete - confirm what you changed afterwards.
- Be concise and helpful. Prefer short paragraphs or a tight bullet list over long prose. Don't repeat the full tool JSON back to the user - summarise it naturally.
- If you truly don't have a tool for what's being asked (e.g. general chit-chat unrelated to courses/deadlines), just answer briefly and naturally without forcing a tool call.`;
}

function toGeminiContents(history: ChatMessageInput[], message: string): GeminiContent[] {
  const trimmed = history.slice(-MAX_HISTORY_MESSAGES);
  const contents: GeminiContent[] = trimmed
    .filter((m) => m.content && m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  contents.push({ role: "user", parts: [{ text: message }] });
  return contents;
}

function extractText(parts: GeminiPart[]): string {
  return parts
    .map((p) => p.text)
    .filter((t): t is string => Boolean(t && t.trim().length > 0))
    .join("\n")
    .trim();
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { message, history } = (body ?? {}) as {
    message?: unknown;
    history?: unknown;
  };

  if (typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  const safeHistory: ChatMessageInput[] = Array.isArray(history)
    ? history.filter(
        (m): m is ChatMessageInput =>
          typeof m === "object" &&
          m !== null &&
          (m as ChatMessageInput).role !== undefined &&
          ["user", "assistant"].includes((m as ChatMessageInput).role) &&
          typeof (m as ChatMessageInput).content === "string"
      )
    : [];

  try {
    const courses = await getCourses();
    const systemInstruction = buildSystemInstruction(courses.map((c) => c.code));
    const contents = toGeminiContents(safeHistory, message.trim());

    let finalText: string | null = null;
    let lastNonEmptyText: string | null = null;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const { content } = await generateContent({
        contents,
        systemInstruction,
        tools: TOOL_DECLARATIONS,
      });

      if (!content) {
        break;
      }

      contents.push(content);

      const functionCalls = content.parts
        .map((p) => p.functionCall)
        .filter((fc): fc is NonNullable<typeof fc> => Boolean(fc));

      const text = extractText(content.parts);
      if (text) lastNonEmptyText = text;

      if (functionCalls.length === 0) {
        finalText = text || lastNonEmptyText;
        break;
      }

      const responseParts: GeminiPart[] = [];
      for (const fc of functionCalls) {
        let result: Record<string, unknown>;
        try {
          result = await runTool(fc.name, fc.args ?? {});
        } catch (err) {
          result = { error: err instanceof Error ? err.message : "Tool execution failed." };
        }
        responseParts.push({
          functionResponse: { name: fc.name, id: fc.id, response: result },
        });
      }
      contents.push({ role: "user", parts: responseParts });
    }

    const reply =
      finalText ||
      lastNonEmptyText ||
      "I wasn't able to work that out just now - could you try rephrasing your question?";

    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof GeminiApiError) {
      if (err.isQuotaError) {
        return NextResponse.json(
          {
            error:
              "The free-tier Gemini quota has been hit for the moment. Please try again in a minute or two.",
            quota: true,
          },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: err.message }, { status: err.status ?? 502 });
    }
    console.error("Chat route failed:", err);
    return NextResponse.json({ error: "Something went wrong answering that. Please try again." }, { status: 500 });
  }
}
