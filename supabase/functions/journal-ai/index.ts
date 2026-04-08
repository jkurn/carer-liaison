/**
 * Supabase Edge Function: journal-ai
 *
 * Two modes (both non-streaming — RN client can't handle SSE):
 * - "chat": Returns conversational response as JSON { text: "..." }
 * - "reflect": Returns RBT extraction as JSON { text: "..." }
 *
 * Provider chain: Groq (primary) → OpenRouter/Qwen (fallback)
 * Auth: Custom JWT verification in function body
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const OPENROUTER_MODEL = "qwen/qwen-2.5-72b-instruct:free";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function verifyJWT(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

interface LLMRequest {
  system: string;
  messages: { role: string; content: string }[];
  maxTokens?: number;
}

async function callLLM(
  req: LLMRequest,
  provider: "groq" | "openrouter",
): Promise<Response> {
  const isGroq = provider === "groq";
  const url = isGroq ? GROQ_URL : OPENROUTER_URL;
  const key = isGroq
    ? Deno.env.get("GROQ_API_KEY")
    : Deno.env.get("OPENROUTER_API_KEY");
  const model = isGroq ? GROQ_MODEL : OPENROUTER_MODEL;
  if (!key) throw new Error(`Missing API key for ${provider}`);

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      ...(isGroq ? {} : { "HTTP-Referer": "https://carerliaison.com" }),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: req.system },
        ...req.messages,
      ],
      max_tokens: req.maxTokens || 800,
      stream: false,
      temperature: 0.7,
    }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const userId = await verifyJWT(req);
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { mode, system, messages, max_tokens } = await req.json();

  const llmReq: LLMRequest = {
    system: system || "",
    messages: messages || [],
    maxTokens: max_tokens || (mode === "reflect" ? 2000 : 800),
  };

  // Try Groq, fall back to OpenRouter
  let response: Response;
  try {
    response = await callLLM(llmReq, "groq");
    if (!response.ok) {
      const errText = await response.text();
      console.error(`Groq error ${response.status}: ${errText}`);
      throw new Error(`Groq ${response.status}`);
    }
  } catch (groqErr) {
    console.warn("Groq failed, trying OpenRouter:", groqErr);
    try {
      response = await callLLM(llmReq, "openrouter");
      if (!response.ok) {
        const errText = await response.text();
        console.error(`OpenRouter error ${response.status}: ${errText}`);
        return new Response(
          JSON.stringify({ error: "AI service unavailable" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } catch (orErr) {
      console.error("Both providers failed:", orErr);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  }

  // Both modes: extract text from OpenAI-compatible response
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "";

  return new Response(
    JSON.stringify({ text }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
