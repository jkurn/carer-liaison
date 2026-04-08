# Carer Liaison — Project Health Report

Generated: 2026-04-08

---

## Overall Health: YELLOW

The product thinking is strong (strategy, core loop, assumptions are stress-tested). The code works. But there are security gaps that must be closed before any real carer uses it — specifically RLS and the exposed API key. Testing covers half the business logic and none of the critical data layer.

---

## 1. Product Strategy: GREEN

| Area | Status | Notes |
|------|--------|-------|
| Core loop (PD-1) | Defined, stress-tested | Trigger + two emotional payoffs (village feeling + mise en place) |
| Strategy hypothesis (PD-2) | Complete | 6-part framework: audience, problem, value prop, differentiation, monetization, acquisition |
| Emotional journey (PD-3) | Complete | Friction points identified (blank page + protective reflex) |
| Riskiest hypothesis (PD-4) | Identified | "Carers will journal on their phone" — validation plan ready |
| Task flows (PD-5) | Complete | 4 unhappy-path flowcharts |
| Success metrics (PD-6) | Defined | "5 carers, 3+ entries in 2 weeks" |
| Feature map (PD-7) | Complete | MoSCoW prioritised |
| Assumptions | 12 documented | 2 new from stress test (A11: displacement, A12: mode-switching) |

**Gap:** All strategy is untested with real carers. The pilot hasn't started.

---

## 2. Security: RED

### Critical (must fix before any real user)

| # | Finding | File | Impact |
|---|---------|------|--------|
| C1 | **No RLS policies on any table** | No migrations exist | Any authenticated user can read/modify any other user's health data |
| C2 | **Gemini API key in git history** | demo/index.html (history) | Key may still be active and billable |
| C3 | **Demo page has stale auth-less AI call** | demo/index.html | Dead code but confusing — remove or fix |

### High

| # | Finding | File | Impact |
|---|---------|------|--------|
| H1 | No rate limiting on assessment endpoint | assessment.html → send-assessment fn | Email spam, Resend abuse |
| H2 | CORS allows all origins (`*`) | journal-ai/index.ts:19 | Cross-origin session hijacking possible |
| H3 | XSS via innerHTML in web app | app/views/settings.js, dashboard.js | Stored XSS with user-controlled names/notes |
| H4 | SQLite stores health data unencrypted | mobile/lib/database.ts:18 | Device seizure = plaintext health data |

### Medium

| # | Finding | Impact |
|---|---------|--------|
| M1 | Client sends system prompts — server trusts them | Prompt injection, cost manipulation |
| M2 | Auth tokens in localStorage on web | XSS → session theft |
| M3 | Email validation client-side only | Bypassable |
| M4 | Service role key used for JWT verification | Over-privileged client if function expands |
| M5 | No timeout on LLM API calls | Hangs under load |

### Low

| # | Finding |
|---|---------|
| L1 | PostHog placeholder key (analytics not working) |
| L2 | Math.random() for UUIDs (not cryptographically secure) |
| L3 | Root .gitignore too minimal (no .env exclusion) |
| L4 | Error messages may log internal details |
| L5 | No CSP headers on public pages |

### Security Action Plan (ordered)

1. **RLS policies** — create migration enabling RLS on entries, profiles, care_pairs, body_state_logs. Policy: `auth.uid() = user_id` on all operations. Test cross-user access.
2. **Revoke Gemini keys** — Google AI Studio, both keys referenced in memory files.
3. **CORS whitelist** — restrict to `https://carerliaison.com` and mobile app origin.
4. **Rate limit assessment** — add IP-based limiting + CAPTCHA to send-assessment edge function.
5. **Move system prompts server-side** — don't let client override system prompt in edge function.
6. **Add LLM call timeouts** — AbortController with 30s timeout on both provider calls.

---

## 3. Testing: YELLOW

| Metric | Value |
|--------|-------|
| Total tests | 42 |
| Test suites | 4 (all passing) |
| Lib coverage | 4/8 files (50%) |
| Component coverage | 0/5 files (0%) |
| Screen coverage | 0/11 files (0%) |
| Edge function coverage | 0/1 files (0%) |
| Test runner | Jest 29.7.0 + jest-expo (healthy) |
| RNTL installed | Yes, unused |

### Critical Testing Gaps

| File | Risk | Why |
|------|------|-----|
| `database.ts` | Data corruption/loss | JSON parsing of nested objects, conditional update logic |
| `sync.ts` | Silent data loss | Entries never reach Supabase if sync logic is wrong |
| `journal-ai/index.ts` | Auth bypass, broken AI | JWT verification + provider fallback untested |

### Test Health Grade: C+

Good foundation (runner works, mocks are clean), but the highest-risk code has zero tests. See `TESTING-STRATEGY.md` for the prioritised backlog.

---

## 4. Code Quality: YELLOW

Audited against DRY, SOLID, KISS, YAGNI, Fail Fast, Law of Demeter, Tell Don't Ask.

### Architecture (strengths)

| Aspect | Status |
|--------|--------|
| TypeScript strict mode | Enabled |
| Type definitions | Comprehensive (types.ts covers all domain objects) |
| State management | Clean Zustand store, UI-only state separated from SQLite |
| Architecture | Clear separation: lib/ (logic), components/ (UI), app/ (routing) |
| System prompt quality | Strong — MI + Clean Language + Narrative + Person-Centered blend |
| Offline-first design | SQLite for persistence, sync on reconnect |
| KISS | No over-engineering. Simple architecture: SQLite → Zustand → React. |
| Open/Closed | Components use config objects (RBTCard, BodyStateSelector) — extensible without modification |
| Law of Demeter | Clean — no deep property chain violations |

### Principle Violations

#### SRP — `chat.tsx` (557 lines) does 4 jobs

Handles: state management (6 variables), AI communication (sendChat, extractReflection), draft persistence, crisis detection, typing indicator, suggestion buttons, and all UI rendering + 200 lines of styles. Four reasons to change = SRP violation.

**Fix:** Extract `useJournalChat()` custom hook (send, finish, dismiss, draft save, phase management) + move styles to `chat.styles.ts`. Screen file becomes thin: render UI, wire hook.

#### DRY — Three violations

**1. Login/Signup duplication.** `login.tsx` (175 lines) and `signup.tsx` (209 lines) share ~70% of structure: same KeyboardAvoidingView wrapper, same TextInput styling, same error bar, same loading state, nearly identical StyleSheet blocks. Fix: shared `AuthForm` component or shared styles.

**2. Crisis phone numbers in 3 places.** `CrisisBanner.tsx`, `journal-ai.ts` system prompt, and `assessment.html` all hardcode Lifeline 13 11 14 and Beyond Blue 1300 22 4636. Safety-critical data should not be scattered — one update, three files to remember. Fix: single `CRISIS_RESOURCES` constant referenced everywhere.

**3. Theme colour leakage.** Most colours go through `theme.ts`, but `CrisisBanner.tsx` hardcodes `#FECACA`, `BodyStateSelector.tsx` has its own colour config, and `[id].tsx` entry detail hardcodes `#F8F6FF` and `#E0D8F0`. Fix: add these to theme.ts.

#### Fail Fast — database.ts has zero error handling

Every database operation (create, read, update) can throw if SQLite encounters an error. No `try-catch` blocks anywhere in database.ts. Errors propagate to random catch blocks up the stack, or crash the app. The Fail Fast principle says: fail immediately with a named, specific exception. Fix: add try-catch with named errors (`EntryNotFoundError`, `DatabaseWriteError`).

#### YAGNI — Dead streaming feature

`ChatBubble.tsx` still accepts an `isStreaming` prop with cursor blink animation. SSE streaming was removed because React Native doesn't support `ReadableStream`. Dead code. Fix: remove `isStreaming` prop and animation.

### Principle Scorecard

| Principle | Grade | Issue |
|-----------|-------|-------|
| SRP | B | `chat.tsx` does 4 jobs. Everything else clean. |
| DRY | C+ | Login/signup dup, crisis numbers x3, theme leakage |
| Open/Closed | A | Config-based extensibility on components |
| KISS | A | No over-engineering |
| YAGNI | A- | One dead feature (isStreaming) |
| Fail Fast | D | database.ts has zero error handling |
| Law of Demeter | A | Clean |
| Tell Don't Ask | A- | One minor React convention |

### Code Quality Grade: B-

Downgraded from initial B+ to B-. Architecture is clean but the DRY violations and missing error handling in the data layer bring it down. The `chat.tsx` SRP violation will become painful as the core loop evolves.

---

## 5. Infrastructure: YELLOW

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase project | Active | Project ID in memory files |
| Edge function (journal-ai) | Deployed | Needs redeploy for latest model fix (gemma-4-26b) |
| Edge function (send-assessment) | Deployed | Returns 500 — Resend domain not verified |
| Landing page | Live on GitHub Pages | carerliaison.com |
| Mobile app | Development only | Not on TestFlight/Play Store |
| CI/CD | None | No automated tests on push |

### Infra Action Plan

1. **Verify Resend domain** — assessment email flow is broken (P0 for acquisition)
2. **Redeploy journal-ai edge function** — push latest model fix
3. **Set up basic CI** — run `npm test` on push via GitHub Actions
4. **TestFlight build** — required before pilot (Expo Go link is unreliable for non-developers)

---

## 6. Deployment Readiness: RED (not ready for pilot)

### Blockers (must fix before 5-carer pilot)

| # | Blocker | Owner | Effort |
|---|---------|-------|--------|
| 1 | RLS policies on all tables | Eng | 2-3 hours |
| 2 | Resend domain verification | Jonathan (admin) | 30 min |
| 3 | Redeploy journal-ai edge function | Eng | 15 min |
| 4 | E2E test: journal chat → reflection on real device | Eng | 1-2 hours |
| 5 | Revoke exposed Gemini keys | Jonathan (admin) | 10 min |

### Should fix (before pilot, not blocking)

| # | Item | Effort |
|---|------|--------|
| 6 | CORS whitelist on edge function | 15 min |
| 7 | Add LLM call timeouts | 30 min |
| 8 | Move system prompts server-side | 1 hour |
| 9 | Rate limit assessment endpoint | 1 hour |
| 10 | database.ts + sync.ts unit tests | 2-3 hours |

### Total estimated effort to pilot-ready: ~8-10 hours of eng work

---

## Summary

| Area | Grade | Trend |
|------|-------|-------|
| Product Strategy | A | Improving (stress-tested this session) |
| Security | D | Static (known issues, not yet addressed) |
| Testing | C+ | Static (good foundation, gaps in critical paths) |
| Code Quality | B- | SRP violation in chat.tsx, DRY violations x3, no error handling in database.ts |
| Infrastructure | C | Static (broken email, no CI, no TestFlight) |
| Pilot Readiness | F | Blocked on 5 items |

**Next milestone:** Close the 5 blockers → run 5-carer pilot → validate hypothesis #1.
