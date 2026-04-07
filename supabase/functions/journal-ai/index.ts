/**
 * Supabase Edge Function: journal-ai
 *
 * Two modes:
 * - "chat": Streams conversational response via SSE (no JSON)
 * - "reflect": Returns full RBT extraction as JSON
 *
 * Provider chain: Groq (primary) → OpenRouter/Qwen (fallback)
 * Auth: Requires valid Supabase JWT in Authorization header
 *
 * Environment secrets (set in Supabase dashboard):
 * - GROQ_API_KEY
 * - OPENROUTER_API_KEY
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const OPENROUTER_MODEL = "qwen/qwen3-235b-a22b:free";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── JWT Verification ────────────────────────────────────────
async function verifyJWT(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return user.id;
}

// ── LLM Call (supports both providers) ──────────────────────
interface LLMRequest {
  system: string;
  messages: { role: string; content: string }[];
  stream: boolean;
  maxTokens?: number;
}

async function callLLM(
  req: LLMRequest,
  provider: "groq" | "openrouter"
): Promise<Response> {
  const isGroq = provider === "groq";
  const url = isGroq ? GROQ_URL : OPENROUTER_URL;
  const key = isGroq
    ? Deno.env.get("GROQ_API_KEY")
    : Deno.env.get("OPENROUTER_API_KEY");
  const model = isGroq ? GROQ_MODEL : OPENROUTER_MODEL;

  if (!key) throw new Error(`Missing API key for ${provider}`);

  const body = {
    model,
    messages: [
      { role: "system", content: req.system },
      ...req.messages,
    ],
    max_tokens: req.maxTokens || (req.stream ? 800 : 2000),
    stream: req.stream,
    temperature: 0.7,
  };

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      ...(isGroq ? {} : { "HTTP-Referer": "https://carerliaison.com" }),
    },
    body: JSON.stringify(body),
  });
}

// ── Main Handler ────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Verify JWT
  const userId = await verifyJWT(req);
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Parse request
  const { mode, system, messages, max_tokens } = await req.json();
  const isChat = mode === "chat";
  const shouldStream = isChat;

  const llmReq: LLMRequest = {
    system: system || "",
    messages: messages || [],
    stream: shouldStream,
    maxTokens: max_tokens,
  };

  // Try Groq first, fall back to OpenRouter
  let response: Response;
  try {
    response = await callLLM(llmReq, "groq");
    if (!response.ok) {
      console.error(`Groq error ${response.status}:`, await response.text());
      throw new Error(`Groq ${response.status}`);
    }
  } catch (groqErr) {
    console.warn("Groq failed, falling back to OpenRouter:", groqErr);
    try {
      response = await callLLM(llmReq, "openrouter");
      if (!response.ok) {
        const errText = await response.text();
        console.error(`OpenRouter error ${response.status}:`, errText);
        return new Response(
          JSON.stringify({ error: "AI service unavailable" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (orErr) {
      console.error("Both providers failed:", orErr);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  // Stream mode: pipe SSE directly to client
  if (shouldStream && response.body) {
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Reflect mode: parse and return structured response
  const data = await response.json();
  const text =
    data?.choices?.[0]?.message?.content ||
    data?.content?.[0]?.text ||
    "";

  return new Response(
    JSON.stringify({ text }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
