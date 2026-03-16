/* ═══════════════════════════════════════════════════════════════
   Dashboard Home — The core daily screen

   Layout (from Pencil design):
   ┌──────────────────────────────────────────────────────────┐
   │  Good morning, [Name]                 Today: Mon 17 Mar │
   ├──────────────────────────────────────────────────────────┤
   │                                                          │
   │  ┌─── Body State ────┐  ┌──── Morning Brief ──────────┐ │
   │  │  Gauge: 72/100    │  │ Sleep: 78/100 — Good        │ │
   │  │  7-day sparkline  │  │ Therapy: Gentle stretch     │ │
   │  │  "Moderate day"   │  │ Meal: Chicken & sweet potato│ │
   │  │  [Log State →]    │  │                             │ │
   │  └───────────────────┘  │ ▸ Why this recommendation?  │ │
   │                          └─────────────────────────────┘ │
   │                                                          │
   │  ┌─── Quick Actions ─────────────────────────────────┐  │
   │  │ [Log Body State] [Search Services] [Get Help]     │  │
   │  └───────────────────────────────────────────────────┘  │
   │                                                          │
   │  ┌─── Recent Activity ───────────────────────────────┐  │
   │  │ Body state logged — 72/100 (yesterday)            │  │
   │  │ Morning brief sent via WhatsApp (today 7am)       │  │
   │  │ Service search: physio near Parramatta (2 days)   │  │
   │  └───────────────────────────────────────────────────┘  │
   └──────────────────────────────────────────────────────────┘
   ═══════════════════════════════════════════════════════════════ */

import '../components/cl-gauge.js';
import '../components/cl-sparkline.js';

// Demo data — will be replaced with Supabase queries
const DEMO = {
  name: 'Sarah',
  bodyState: {
    current: 72,
    trend: [65, 70, 68, 75, 78, 72, 72],
    label: 'Moderate — steady week',
  },
  sleep: { score: 78, label: 'Good', insight: 'Deep sleep above baseline. Expect a calm day.' },
  therapy: { name: 'Gentle stretch', duration: '20 min', reason: 'Matched to current body state (72/100). Upper body focus due to 3-day shoulder tension trend.' },
  meal: { name: 'Chicken & sweet potato', prep: '2pm', note: 'Shopping list sent to phone.' },
  activity: [
    { text: 'Body state logged — 72/100', time: 'Yesterday, 9:15am', icon: 'heart' },
    { text: 'Morning brief sent via WhatsApp', time: 'Today, 7:00am', icon: 'message' },
    { text: 'Service search: physio near Parramatta', time: '2 days ago', icon: 'search' },
  ],
};

const ICONS = {
  heart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
  message: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
  arrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  phone: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>',
};

function formatDate() {
  return new Date().toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function render(el) {
  const d = DEMO;

  el.innerHTML = `
    <!-- GREETING -->
    <div class="row-between" style="margin-bottom: var(--sp-6);">
      <div>
        <h2 style="margin-bottom: 2px;">${getGreeting()}, ${d.name}</h2>
        <p class="text-sm text-muted">Here's how things look today</p>
      </div>
      <div class="badge badge-muted">${formatDate()}</div>
    </div>

    <!-- TOP CARDS: Body State + Morning Brief -->
    <div class="grid-2" style="margin-bottom: var(--sp-6); align-items: start;">

      <!-- BODY STATE CARD -->
      <div class="card stack stack-4">
        <div class="row-between">
          <div class="eyebrow">Body State</div>
          <span class="badge badge-teal">Today</span>
        </div>

        <div class="row gap-6" style="gap: var(--sp-8);">
          <cl-gauge value="${d.bodyState.current}" max="100" label="Current" size="110"></cl-gauge>
          <div class="stack stack-3" style="flex: 1;">
            <div>
              <p class="text-sm text-muted">7-day trend</p>
              <cl-sparkline values="${d.bodyState.trend.join(',')}" width="160" height="40"></cl-sparkline>
            </div>
            <p class="text-sm" style="color: var(--dark);">${d.bodyState.label}</p>
          </div>
        </div>

        <a href="#/body-state" class="btn btn-secondary btn-sm" style="align-self: flex-start;">
          View history ${ICONS.arrow}
        </a>
      </div>

      <!-- MORNING BRIEF CARD -->
      <div class="card stack stack-4">
        <div class="row-between">
          <div class="eyebrow">Morning Brief</div>
          <span class="badge badge-green"><span class="badge-dot"></span> Sent 7am</span>
        </div>

        <!-- Sleep -->
        <div class="card-surface row gap-4" style="padding: var(--sp-4);">
          <div class="icon-box icon-box-green">
            ${ICONS.heart}
          </div>
          <div style="flex: 1;">
            <p style="font-weight: 600; color: var(--dark); font-size: 0.9rem;">
              Sleep: ${d.sleep.score}/100 — ${d.sleep.label}
            </p>
            <p class="text-sm text-muted">${d.sleep.insight}</p>
          </div>
        </div>

        <!-- Therapy -->
        <div class="card-surface row gap-4" style="padding: var(--sp-4);">
          <div class="icon-box icon-box-blue">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
          </div>
          <div style="flex: 1;">
            <p style="font-weight: 600; color: var(--dark); font-size: 0.9rem;">
              Therapy: ${d.therapy.name}
            </p>
            <p class="text-sm text-muted">${d.therapy.duration} session</p>
          </div>
        </div>

        <!-- AI Reasoning accordion (Flo Guo: "show the work") -->
        <details class="reasoning-toggle">
          <summary class="text-sm" style="cursor: pointer; color: var(--teal); font-weight: 500; user-select: none;">
            ▸ Why this recommendation?
          </summary>
          <p class="text-sm text-muted" style="margin-top: var(--sp-2); padding-left: var(--sp-4); border-left: 2px solid var(--teal-pale);">
            ${d.therapy.reason}
          </p>
        </details>

        <!-- Meal -->
        <div class="card-surface row gap-4" style="padding: var(--sp-4);">
          <div class="icon-box icon-box-amber">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div style="flex: 1;">
            <p style="font-weight: 600; color: var(--dark); font-size: 0.9rem;">
              Meal: ${d.meal.name}
            </p>
            <p class="text-sm text-muted">Prep at ${d.meal.prep}. ${d.meal.note}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- QUICK ACTIONS -->
    <div style="margin-bottom: var(--sp-6);">
      <h3 style="margin-bottom: var(--sp-4);">Quick Actions</h3>
      <div class="grid-3">
        <button class="card-flat row gap-3" style="cursor: pointer; border: 1.5px solid var(--border); transition: all 0.15s;" onmouseover="this.style.borderColor='var(--teal)'" onmouseout="this.style.borderColor='var(--border)'">
          <div class="icon-box icon-box-teal">${ICONS.plus}</div>
          <div style="text-align: left;">
            <p style="font-weight: 600; color: var(--dark); font-size: 0.9rem;">Log Body State</p>
            <p class="text-xs text-muted">Quick one-press log</p>
          </div>
        </button>
        <a href="#/services" class="card-flat row gap-3" style="text-decoration: none; border: 1.5px solid var(--border); transition: all 0.15s;" onmouseover="this.style.borderColor='var(--teal)'" onmouseout="this.style.borderColor='var(--border)'">
          <div class="icon-box icon-box-blue">${ICONS.search}</div>
          <div style="text-align: left;">
            <p style="font-weight: 600; color: var(--dark); font-size: 0.9rem;">Find Services</p>
            <p class="text-xs text-muted">NDIS providers nearby</p>
          </div>
        </a>
        <a href="tel:1800422737" class="card-flat row gap-3" style="text-decoration: none; border: 1.5px solid var(--border); transition: all 0.15s;" onmouseover="this.style.borderColor='var(--coral)'" onmouseout="this.style.borderColor='var(--border)'">
          <div class="icon-box icon-box-coral">${ICONS.phone}</div>
          <div style="text-align: left;">
            <p style="font-weight: 600; color: var(--dark); font-size: 0.9rem;">Get Help</p>
            <p class="text-xs text-muted">Carer Gateway 1800 422 737</p>
          </div>
        </a>
      </div>
    </div>

    <!-- RECENT ACTIVITY -->
    <div>
      <h3 style="margin-bottom: var(--sp-4);">Recent Activity</h3>
      <div class="card stack stack-2">
        ${d.activity.map((a, i) => `
          <div class="row gap-4" style="padding: var(--sp-3) 0; ${i < d.activity.length - 1 ? 'border-bottom: 1px solid var(--border-light);' : ''}">
            <div class="icon-box icon-box-teal" style="width: 32px; height: 32px;">
              ${ICONS[a.icon] || ''}
            </div>
            <div style="flex: 1;">
              <p class="text-sm" style="color: var(--dark);">${a.text}</p>
              <p class="text-xs text-muted">${a.time}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // GSAP stagger animation for cards (if available)
  if (typeof gsap !== 'undefined') {
    gsap.from(el.querySelectorAll('.card, .card-flat'), {
      y: 20,
      opacity: 0,
      duration: 0.4,
      stagger: 0.06,
      ease: 'power2.out',
    });
  }
}

export function teardown() {
  // Cleanup if needed (e.g., intervals, subscriptions)
}
