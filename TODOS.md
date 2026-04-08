# Carer Liaison — TODO Backlog

Source of truth for all outstanding work. Ordered by priority within each section.
Cross-references: `PROJECT-HEALTH.md` (health report), `TESTING-STRATEGY.md` (test plan), `PRODUCT-STRATEGY.md` (product decisions), `ASSUMPTIONS.md` (risk log).

Last updated: 2026-04-08.

---

## Pilot Blockers (must fix before 5-carer pilot)

These 5 items gate the validation plan in PD-4. Nothing else matters until these are done.

### B1. RLS Policies on All Tables
- **What:** Create Supabase migration enabling RLS on `entries`, `profiles`, `care_pairs`, `body_state_logs`. Add policies: `auth.uid() = user_id` on SELECT/INSERT/UPDATE/DELETE for each table.
- **Why:** No RLS = any authenticated user can read/modify any other user's health data. This is the single most dangerous gap. The anon key is public by design — RLS is the ONLY security boundary.
- **Validate:** Test that user A cannot query user B's entries via Supabase client.
- **Effort:** 2-3 hours
- **Priority:** P0 CRITICAL — before any real user data
- **Ref:** PROJECT-HEALTH.md C1

### B2. Resend Domain Verification
- **What:** Verify `carerliaison.com` domain in Resend so emails send from `hello@carerliaison.com`.
- **Why:** Assessment Edge Function returns 500 — Resend rejects the unverified `from` address. This breaks the acquisition funnel entirely.
- **Status:** RESEND_API_KEY is set in Supabase secrets. Domain verification pending (DNS records needed).
- **Effort:** 30 min (admin task)
- **Priority:** P0 — assessment flow is broken without this
- **Ref:** PROJECT-HEALTH.md infra

### B3. Redeploy journal-ai Edge Function
- **What:** Deploy the latest edge function code to Supabase. The OpenRouter fallback model was fixed from a nonexistent model to `google/gemma-4-26b-a4b-it:free`.
- **Why:** The deployed edge function still has the broken fallback. If Groq goes down, the fallback silently fails.
- **Effort:** 15 min
- **Priority:** P0
- **Command:** `supabase functions deploy journal-ai`

### B4. E2E Test: Journal Chat → Reflection on Real Device
- **What:** Complete one full journal entry on a real Android device — send message, get Lia response, tap "Finish entry", see RBT reflection cards on entry detail screen.
- **Why:** PD-7 shows "Built, needs AI fix" and "needs e2e test" for the core loop. The pilot requires this to work.
- **Effort:** 1-2 hours (includes debugging)
- **Priority:** P0

### B5. Revoke Exposed Gemini API Keys
- **What:** Revoke both Gemini API keys that are in git history (see `project_revoke_gemini_keys.md` for the specific keys).
- **Why:** Keys are in git history from when they were hardcoded in `demo/index.html`. May still be active and billable.
- **Where:** Google AI Studio → API Keys → revoke.
- **Effort:** 10 min (admin task)
- **Priority:** P0 CRITICAL
- **Ref:** PROJECT-HEALTH.md C2

---

## Security (fix before or shortly after pilot)

### S1. CORS Whitelist on Edge Function
- **What:** Change `Access-Control-Allow-Origin: *` to a whitelist: `https://carerliaison.com` and mobile app origin.
- **File:** `supabase/functions/journal-ai/index.ts:19`
- **Why:** Wildcard CORS + valid credentials = any website can make authenticated API calls on behalf of a logged-in carer.
- **Effort:** 15 min
- **Priority:** P1
- **Ref:** PROJECT-HEALTH.md H2

### S2. Move System Prompts Server-Side
- **What:** The edge function currently accepts `system` prompt from the client request body. Move the chat and reflect system prompts into the edge function itself. The client should only send `mode` and `messages`.
- **File:** `supabase/functions/journal-ai/index.ts:87`, `mobile/lib/journal-ai.ts`
- **Why:** Any authenticated user can override the system prompt — prompt injection, cost manipulation via `max_tokens`, or extracting the system prompt.
- **Effort:** 1 hour
- **Priority:** P1
- **Ref:** PROJECT-HEALTH.md M1

### S3. Add LLM Call Timeouts
- **What:** Add `AbortController` with 30-second timeout to both Groq and OpenRouter fetch calls.
- **File:** `supabase/functions/journal-ai/index.ts:54-71`
- **Why:** No timeout = hang forever if LLM provider is slow. Supabase's own 60s timeout is the only backstop.
- **Effort:** 30 min
- **Priority:** P1
- **Ref:** PROJECT-HEALTH.md M5

### S4. Rate Limit + CAPTCHA on Assessment Endpoint
- **What:** Add IP-based rate limiting (5 req/min) and Cloudflare Turnstile CAPTCHA to `send-assessment` edge function.
- **Why:** Public endpoint, no auth, sends emails via Resend. Abuse = email spam, Resend domain blacklisting.
- **Effort:** 1-2 hours
- **Priority:** P1
- **Ref:** PROJECT-HEALTH.md H1

### S5. Fix XSS in Web App Views
- **What:** Escape user-controlled data (names, NDIS numbers, notes) before inserting into HTML via innerHTML in `settings.js`, `dashboard.js`, `onboarding.js`.
- **Why:** Stored XSS — if a user sets their name to `<img src=x onerror=alert(1)>`, it executes.
- **Effort:** 1 hour
- **Priority:** P1 (before dual-user login — that's when user-controlled names become cross-user)
- **Ref:** PROJECT-HEALTH.md H3

### S6. Root .gitignore
- **What:** Add `.env`, `.env.*`, `.DS_Store`, `node_modules/`, `*.pem` to root `.gitignore`. Currently only excludes `.claude/`.
- **Effort:** 5 min
- **Priority:** P2
- **Ref:** PROJECT-HEALTH.md L3

---

## Testing (see TESTING-STRATEGY.md for full plan)

### T1. Unit Tests: database.ts
- **What:** Test `parseJSON`, `rowToEntry`, `updateEntry`, `createEntry`, `getDraftEntry`, `getEntries`.
- **Why:** JSON parsing of nested objects (conversation, RBT items, insights) and conditional update logic. A bug here = data loss or corruption.
- **Effort:** 2-3 hours
- **Priority:** P1
- **Ref:** TESTING-STRATEGY.md Batch 1

### T2. Unit Tests: sync.ts
- **What:** Test `syncEntries` (no unsynced entries, mixed success/failure, markSynced only on success) and `trySyncIfOnline` (no session → skip, exception handling).
- **Why:** Sync bugs = entries never reach Supabase. Silent data loss.
- **Effort:** 1-2 hours
- **Priority:** P1
- **Ref:** TESTING-STRATEGY.md Batch 1

### T3. Edge Function Tests: journal-ai
- **What:** Test JWT verification (valid/invalid/missing), mode routing, Groq→OpenRouter fallback, response format, CORS preflight.
- **Why:** Auth bypass or broken AI responses.
- **Setup:** Deno test runner with mocked fetch.
- **Effort:** 2-3 hours
- **Priority:** P1
- **Ref:** TESTING-STRATEGY.md Batch 2

### T4. Component Tests
- **What:** ChatBubble, RBTCard, CrisisBanner, EntryCard, BodyStateSelector — render correctness using `@testing-library/react-native` (already installed).
- **Effort:** 2-3 hours
- **Priority:** P2
- **Ref:** TESTING-STRATEGY.md Batch 3

### T5. CI: Run Tests on Push
- **What:** GitHub Actions workflow: run `npm test` in `mobile/` on every push to main.
- **Why:** No automated testing on push means test regressions go unnoticed.
- **Effort:** 30 min
- **Priority:** P2

---

## Infrastructure

### I1. Admin Notification for Assessment Leads
- **What:** Verify admin email to `hello@carerliaison.com` works once Resend domain is verified (B2).
- **Why:** Jonathan needs to see leads as they come in.
- **Depends on:** B2
- **Effort:** 15 min (verify only)

### I2. Deep Link Redirect for Auth Emails
- **What:** Add `carer-liaison://` to Supabase allowed redirect URLs. Update email templates. Re-enable "Confirm email."
- **Why:** Confirmation links point to `localhost`. Must work on real device.
- **Depends on:** TestFlight/Play Store deployment
- **Priority:** P1 — before public launch (not needed for guided pilot)

### I3. CDN Fallback for supabase-js
- **What:** Web app imports supabase-js from `esm.sh`. If CDN is down, entire SPA fails.
- **Options:** Vendor locally, add fallback script tag, or accept the risk.
- **Priority:** P2

---

## UX

### U1. Empty State: Settings
- **What:** Settings page assumes care pair exists. Needs graceful empty state.
- **Status:** Dashboard + body-state have empty states. Settings does not.
- **Priority:** P2

### U2. Remove/Fix Stale Demo Page
- **What:** `demo/index.html` calls the edge function without auth (always 401) and uses a Gemini response format. Either remove it or make it work with static content.
- **Why:** Dead code that confuses the codebase and contains the old exposed API key pattern.
- **Priority:** P2
- **Ref:** PROJECT-HEALTH.md C3

---

## Mobile App (Phase 2)

### P2-1. Voice Input (On-Device STT)
- **What:** Add voice journaling via `expo-speech-recognition` (wraps iOS/Android native speech APIs).
- **Why:** Key differentiator for carers who can't type — holding a child, muscle fatigue, hands occupied. Audio stays on-device for privacy.
- **Validate in pilot:** Ask carers "Was there a moment you wanted to speak instead of type?"
- **Depends on:** V1 pilot complete
- **Priority:** P1 Phase 2 — first Phase 2 feature

### P2-2. Client-Side Crisis Keyword Filter
- **What:** Scan journal text for self-harm/suicide keywords before AI call. Show crisis resources banner immediately. Belt-and-suspenders with the system prompt detection already in V1.
- **Why:** V1 relies solely on AI system prompt to detect distress. Client-side scan catches cases AI misses.
- **Priority:** P1 Phase 2 — safety improvement

### P2-3. SQLite Encryption
- **What:** Enable SQLCipher encryption on the local database, or encrypt sensitive fields (conversation, NDIS numbers) with a key from SecureStore.
- **Why:** Journal entries contain deeply personal health data. Plaintext SQLite = readable on jailbroken/seized device.
- **Priority:** P1 Phase 2
- **Ref:** PROJECT-HEALTH.md H4

---

## Features (Phase 2+)

### F1. Dual-User Login (Participant Access)
- **What:** Allow the participant to create their own account and see shared data.
- **Depends on:** `participant_user_id` column on `care_pairs`, updated RLS.
- **Pre-req:** Fix XSS (S5) before user-controlled names become cross-user.

### F2. Delete Account + Data Export
- **What:** Settings "Export" and "Delete" buttons currently do nothing. Need Supabase Edge Function for data export + cascade delete.
- **Why:** Australian Privacy Act compliance.

### F3. AI Morning Brief
- **What:** Generate daily briefs based on body state trends, therapy schedule, meal plans.
- **Depends on:** LLM integration, body state history (done).

### F4. Real Service Search
- **What:** Replace demo data in service-search.js with real NDIS provider directory API.

---

## Recently Completed

### 2026-04-08
- [x] Product Discovery: PD-1 through PD-7 completed in PRODUCT-STRATEGY.md
- [x] Stress-tested core loop and assumptions against founder lived experience
- [x] Added assumptions A11 (displacement vs adoption) and A12 (mode-switching)
- [x] Upgraded Lia's system prompt: MI + Clean Language + Narrative + Person-Centered blend
- [x] Fixed OpenRouter fallback model (was nonexistent, now google/gemma-4-26b-a4b-it:free)
- [x] Entry detail: moved RBT reflection cards above conversation
- [x] Entry detail: removed "Next steps" action items (contradicted core loop)
- [x] Removed dead `content[0].text` parsing in extractReflection
- [x] Created TESTING-STRATEGY.md
- [x] Created PROJECT-HEALTH.md (security audit, test coverage, infra assessment)
- [x] Saved AI companion prompt design reference to Resources/

### 2026-03-27
- [x] Landing page: All CTAs now point to assessment (removed demo/demo2 links)
- [x] Copywriting: Generalised from autobiography to archetype (they/them, removed "28 years", universal examples)
- [x] Assessment email: Supabase Edge Function deployed with Resend integration
- [x] Assessment email: Personalised HTML email with tier-specific content, pressure points, resources
- [x] Leads table: Stores assessment submissions (email, name, score, tier, answers)
