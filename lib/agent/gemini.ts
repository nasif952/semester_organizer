// Minimal REST client for the Gemini API's generateContent endpoint, with
// just enough typing to support multi-turn function calling. Kept dependency
// -free (no @google/genai SDK) since the app is small and this keeps the
// request/response shape fully visible.

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-flash-latest";

export type GeminiRole = "user" | "model";

export interface GeminiFunctionCall {
  name: string;
  args: Record<string, unknown>;
  id?: string;
}

export interface GeminiFunctionResponse {
  name: string;
  id?: string;
  response: Record<string, unknown>;
}

export interface GeminiPart {
  text?: string;
  functionCall?: GeminiFunctionCall;
  functionResponse?: GeminiFunctionResponse;
}

export interface GeminiContent {
  role: GeminiRole;
  parts: GeminiPart[];
}

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: "OBJECT";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: GeminiContent;
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
}

interface GeminiErrorBody {
  error?: { code?: number; message?: string; status?: string };
}

export class GeminiApiError extends Error {
  /** True when Gemini returned a rate-limit / free-tier quota error (HTTP 429). */
  isQuotaError: boolean;
  status?: number;

  constructor(message: string, opts: { isQuotaError?: boolean; status?: number } = {}) {
    super(message);
    this.name = "GeminiApiError";
    this.isQuotaError = opts.isQuotaError ?? false;
    this.status = opts.status;
  }
}

export async function generateContent(params: {
  contents: GeminiContent[];
  systemInstruction: string;
  tools?: GeminiFunctionDeclaration[];
}): Promise<{ content: GeminiContent | null; finishReason?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiApiError("GEMINI_API_KEY is not configured on the server.");
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `${GEMINI_API_BASE}/${model}:generateContent`;

  const body: Record<string, unknown> = {
    contents: params.contents,
    systemInstruction: { parts: [{ text: params.systemInstruction }] },
    generationConfig: { temperature: 0.2 },
  };
  if (params.tools && params.tools.length > 0) {
    body.tools = [{ functionDeclarations: params.tools }];
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new GeminiApiError(
      `Failed to reach the Gemini API: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (!res.ok) {
    let parsed: GeminiErrorBody | null = null;
    try {
      parsed = (await res.json()) as GeminiErrorBody;
    } catch {
      // response body wasn't JSON - fall through with a generic message
    }
    const message = parsed?.error?.message || `Gemini API request failed (HTTP ${res.status}).`;
    const isQuotaError =
      res.status === 429 || parsed?.error?.status === "RESOURCE_EXHAUSTED";
    throw new GeminiApiError(message, { isQuotaError, status: res.status });
  }

  const json = (await res.json()) as GeminiGenerateContentResponse;

  if (json.promptFeedback?.blockReason) {
    throw new GeminiApiError(`Gemini blocked the response: ${json.promptFeedback.blockReason}`);
  }

  const candidate = json.candidates?.[0];
  return { content: candidate?.content ?? null, finishReason: candidate?.finishReason };
}
