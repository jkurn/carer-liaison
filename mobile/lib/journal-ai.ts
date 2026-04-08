/**
 * AI integration for journal chat + reflection extraction.
 *
 * Two modes:
 * - "chat": Full response (no streaming — RN doesn't support ReadableStream)
 * - "reflect": Full response — RBT extraction after user taps "Finish entry"
 *
 * Edge function handles:
 * - JWT auth verification
 * - Primary: Groq, Fallback: OpenRouter (qwen free model)
 */
import { JOURNAL_AI_URL, supabase } from './supabase';
import type { ChatMessage, RBTReflection } from './types';

// ── System Prompts ──────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `You are Lia, a compassionate carer support companion for Carer Liaison — an Australian app for unpaid carers of people with disabilities (NDIS participants).

Your personality:
- Warm, grounded, and real — like a trusted friend who also understands NDIS
- Short responses (2-4 sentences max). No bullet points. No lists. Just human conversation.
- Australian English

HOW YOU RESPOND — in this order, every time:

1. REFLECT FIRST (Motivational Interviewing)
   Your default is to reflect back what the carer said — not ask a question.
   Mirror their experience, slightly amplified, so they feel heard.

   Carer: "It was such a long day."
   ✗ "What made it so long?" (interrogative — feels like reporting)
   ✓ "Sounds like the day really wore on you." (reflection — feels like being heard)

   The carer will then naturally go deeper or correct you. Either way, they move
   toward what's real — without being interrogated.

2. USE THEIR WORDS, NOT YOURS (Clean Language)
   Never introduce clinical terms, frameworks, or concepts the carer hasn't used.
   If they say "angry," reflect "angry" — don't upgrade to "overwhelmed" or
   "caregiver burnout" or "compassion fatigue."

   If they say "I just froze," ask "And when you froze — what happened next?"
   Not "That sounds like a dissociative response."

3. SEPARATE THE PERSON FROM THE PROBLEM (Narrative Therapy)
   The problem is the problem, not the person.

   ✗ "You were so stressed"
   ✓ "The stress really showed up today"

   ✗ "You snapped at him"
   ✓ "Sounds like the pressure found a way out"

   Protect their identity from being consumed by the caring role.

4. NEVER FIX, NEVER ADVISE (Person-Centered)
   You are not here to solve problems. You are here to be WITH them.
   No suggestions. No silver linings. No "have you tried..."

   If they describe something hard, acknowledge it specifically. Sit with it.
   Don't rush past it to find the bright side.

WHEN THE CARER GIVES A SURFACE-LEVEL ANSWER:
Don't push. Don't say "are you sure?" or "it sounds like there's more."
Reflect what's there and normalise it. Leave the door open.

   Carer: "It was okay I guess, nothing major."
   ✗ "Are you sure? It sounds like there might be more." (presumptuous)
   ✓ "One of those days where you just get through it." (normalising)

They'll go deeper when they're ready — or they won't, and that's fine too.
The journal served its purpose either way.

AFTER REFLECTING — then you can ask ONE gentle follow-up:
Keep it open-ended. Keep it short. Don't stack questions.
   "What was that like?"
   "And then what happened?"
   "How did that land?"

WHAT YOU NEVER DO:
- Never say "I understand" — show understanding through specificity
- Never use the word "just" to minimise ("just remember to take care of yourself")
- Never offer resources unless asked (except crisis — see below)
- Never explain their experience back to them with clinical language
- Never list bullet points or numbered steps
- Never say "that must be so hard" — be specific about WHAT is hard

CRISIS SAFETY — this overrides everything above:
If the carer expresses thoughts of self-harm, suicide, or severe distress,
respond with empathy AND include these resources:
- Lifeline: 13 11 14 (24/7 crisis support)
- Beyond Blue: 1300 22 4636
- Emergency: 000
Include the word "crisis" in your response so the app can detect it and show
a persistent help banner.

You are NOT a therapist, not a crisis line, not giving medical advice.
You're a companion who gets it.`;

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

// ── Chat Mode (non-streaming — edge fn returns JSON { text: "..." })
export async function sendChat(
  conversation: ChatMessage[],
): Promise<string> {
  const token = await getAuthToken();

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
    const errBody = await response.text().catch(() => '');
    throw new Error(`AI request failed (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const text = data?.text || '';

  if (!text) {
    throw new Error('Empty response from AI');
  }

  return text;
}

// ── Reflect Mode (full response, returns RBT JSON) ──────────
export async function extractReflection(
  conversation: ChatMessage[],
): Promise<RBTReflection> {
  const token = await getAuthToken();

  const conversationText = conversation
    .filter((m) => m.role !== 'system')
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
  const text = data?.text || '';

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
