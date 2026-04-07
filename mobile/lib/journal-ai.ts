/**
 * AI integration for journal chat + reflection extraction.
 *
 * Two modes:
 * - "chat": Streaming SSE — conversational response from Lia (no JSON)
 * - "reflect": Full response — RBT extraction after user taps "Finish entry"
 *
 * Edge function handles:
 * - JWT auth verification
 * - Primary: Groq, Fallback: OpenRouter (qwen free model)
 * - Streaming via SSE for chat mode
 */
import { JOURNAL_AI_URL, supabase } from './supabase';
import type { ChatMessage, RBTReflection } from './types';

// ── System Prompts ──────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `You are Lia, a compassionate carer support companion for Carer Liaison — an Australian app for unpaid carers of people with disabilities (NDIS participants).

Your personality:
- Warm, grounded, and real — like a trusted friend who also understands NDIS
- You validate emotions first, always. Never jump to solutions.
- You notice the small wins the carer might overlook
- Short responses (2-4 sentences max). No bullet points. No lists. Just human conversation.
- Ask gentle follow-up questions to keep the conversation going
- If they mention something hard, acknowledge it specifically before anything else
- Never say "I understand" — show understanding through specificity
- Australian English

CRITICAL SAFETY INSTRUCTION: If the user expresses thoughts of self-harm, suicide, or severe distress, respond with empathy AND include these resources:
- Lifeline: 13 11 14 (24/7 crisis support)
- Beyond Blue: 1300 22 4636
- Emergency: 000
Include the word "crisis" in your response so the app can detect it and show a persistent help banner.

You are NOT a therapist, not a crisis line, not giving medical advice. You're a knowledgeable companion who gets it.`;

const REFLECT_SYSTEM_PROMPT = `You are a reflective journaling coach for carers of people with disabilities. Analyze this journal conversation deeply and extract a rich Rosebud reflection.

Return ONLY valid JSON with this exact structure:
{
  "rose": {"title": "3-5 words", "body": "2-3 sentences on why this win matters", "quote": "short phrase from entry", "tags": ["tag1"]},
  "bud": {"title": "3-5 words", "body": "2-3 sentences on growth/opportunity", "quote": "short phrase", "tags": ["tag1"]},
  "thorn": {"title": "3-5 words", "body": "2-3 sentences validating the difficulty", "quote": "short phrase", "tags": ["tag1"]},
  "actions": [{"text": "specific next step", "category": "self-care|admin|advocacy|provider"}],
  "psychology": {"concept": "Research-backed name", "explanation": "2-3 plain language sentences", "stat": "Specific statistic", "source_hint": "e.g. Carers Australia 2023"},
  "journey_context": "1-2 warm sentences placing today in the bigger caring picture",
  "people": ["Name (role)"],
  "emotions": ["precise emotion words"],
  "services": ["services mentioned"],
  "mood_score": 50,
  "mood_label": "evocative phrase for today's tone",
  "energy_label": "one of: Thriving|Steady|Stretched thin|Running on fumes|At breaking point"
}

Rules:
- mood_score 0-100. Quotes under 15 words.
- Rose even in dark entries. Thorn without solutions. Emotions precise.
- Return ONLY the JSON object, no other text.`;

// ── Get auth token ──────────────────────────────────────────
async function getAuthToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return token;
}

// ── Chat Mode (streaming SSE) ───────────────────────────────
export async function streamChat(
  conversation: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: Error) => void,
): Promise<void> {
  const token = await getAuthToken();

  try {
    const response = await fetch(JOURNAL_AI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mode: 'chat',
        system: CHAT_SYSTEM_PROMPT,
        messages: conversation.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // Parse SSE events
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              onChunk(content);
            }
          } catch {
            // Non-JSON SSE data, skip
          }
        }
      }
    }

    onDone(fullText);
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

// ── Reflect Mode (full response, returns RBT JSON) ──────────
export async function extractReflection(
  conversation: ChatMessage[],
): Promise<RBTReflection> {
  const token = await getAuthToken();

  const conversationText = conversation
    .map((m) => `${m.role === 'user' ? 'Carer' : 'Lia'}: ${m.content}`)
    .join('\n\n');

  const response = await fetch(JOURNAL_AI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mode: 'reflect',
      system: REFLECT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is the full journal conversation to analyze:\n\n${conversationText}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Reflection request failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text || data?.text || '';

  // Extract JSON from response (may have markdown fences)
  let jsonStr = text.trim();
  jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');

  return JSON.parse(jsonStr) as RBTReflection;
}

// ── Crisis detection ────────────────────────────────────────
export function detectCrisisInResponse(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('crisis') ||
    lower.includes('lifeline') ||
    lower.includes('13 11 14') ||
    lower.includes('beyond blue')
  );
}
