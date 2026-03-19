/* ═══════════════════════════════════════════════════════════════
   Dashboard Home — The core daily screen (wired to Supabase)

   Layout:
   ┌──────────────────────────────────────────────────────────┐
   │  Good morning, [Name]                 Today: Mon 17 Mar │
   ├──────────────────────────────────────────────────────────┤
   │  ┌─── Body State ────┐  ┌──── Morning Brief ──────────┐ │
   │  │  Gauge: 72/100    │  │ (static for MVP)            │ │
   │  │  7-day sparkline  │  │                             │ │
   │  │  [Log State →]    │  └─────────────────────────────┘ │
   │  └───────────────────┘                                   │
   │  ┌─── Quick Actions ─────────────────────────────────┐  │
   │  │ [Log Body State] [Search Services] [Get Help]     │  │
   │  └───────────────────────────────────────────────────┘  │
   │  ┌─── Recent Activity ───────────────────────────────┐  │
   │  │ (from body_state_logs)                            │  │
   │  └───────────────────────────────────────────────────┘  │
   └──────────────────────────────────────────────────────────┘
   ═══════════════════════════════════════════════════════════════ */

import '../components/cl-gauge.js';
import '../components/cl-sparkline.js';
import { supabase, getUser, getProfile } from '../lib/supabase.js';

const ICONS = {
  heart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
  arrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
  phone: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>',
};

function formatDate() {
  return new Date().toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function bodyLabel(score) {
  if (score >= 80) return 'Great day';
  if (score >= 65) return 'Good — steady';
  if (score >= 50) return 'Moderate';
  return 'Tough day';
}

export async function render(el) {
  // Show loading state
  el.innerHTML = `<div class="card" style="text-align:center;padding:var(--sp-12)"><p class="text-muted">Loading dashboard...</p></div>`;

  const user = await getUser();
  if (!user) return;

  const profile = await getProfile();
  if (!profile) { location.hash = '#/onboarding'; return; }

  // Fetch last 7 body state logs
  const { data: logs } = await supabase
    .from('body_state_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(7);

  const recentLogs = logs || [];
  const currentLog = recentLogs[0] || null;
  const sparkValues = recentLogs.map(l => l.score).reverse();
  const currentScore = currentLog ? currentLog.score : 0;
  const trendLabel = recentLogs.length > 0
    ? `${bodyLabel(currentScore)} — ${recentLogs.length}-day trend`
    : 'No data yet — log your first body state';

  el.innerHTML = `
    <!-- GREETING -->
    <div class="row-between" style="margin-bottom: var(--sp-6);">
      <div>
        <h2 style="margin-bottom: 2px;">${getGreeting()}, ${profile.name.split(' ')[0]}</h2>
        <p class="text-sm text-muted">Here's how things look today</p>
      </div>
      <div class="badge badge-muted">${formatDate()}</div>
    </div>

    <!-- TOP CARDS -->
    <div class="grid-2" style="margin-bottom: var(--sp-6); align-items: start;">

      <!-- BODY STATE CARD -->
      <div class="card stack stack-4">
        <div class="row-between">
          <div class="eyebrow">Body State</div>
          <span class="badge badge-teal">${currentLog ? 'Latest' : 'No data'}</span>
        </div>

        ${currentLog ? `
        <div class="row gap-6" style="gap: var(--sp-8);">
          <cl-gauge value="${currentScore}" max="100" label="Current" size="110"></cl-gauge>
          <div class="stack stack-3" style="flex: 1;">
            <div>
              <p class="text-sm text-muted">7-day trend</p>
              ${sparkValues.length > 1
                ? `<cl-sparkline values="${sparkValues.join(',')}" width="160" height="40"></cl-sparkline>`
                : '<p class="text-xs text-muted">Need 2+ logs for trend</p>'}
            </div>
            <p class="text-sm" style="color: var(--dark);">${trendLabel}</p>
          </div>
        </div>
        ` : `
        <div style="text-align: center; padding: var(--sp-6) 0;">
          <p class="text-muted" style="margin-bottom: var(--sp-3);">No body state logged yet</p>
          <p class="text-xs text-muted">Tap the button below to record your first entry</p>
        </div>
        `}

        <a href="#/body-state" class="btn btn-secondary btn-sm" style="align-self: flex-start;">
          ${currentLog ? 'View history' : 'Log first entry'} ${ICONS.arrow}
        </a>
      </div>

      <!-- MORNING BRIEF CARD (static MVP) -->
      <div class="card stack stack-4">
        <div class="row-between">
          <div class="eyebrow">Morning Brief</div>
          <span class="badge badge-muted">Coming soon</span>
        </div>

        <div style="padding: var(--sp-4) 0; text-align: center;">
          <p class="text-sm text-muted" style="margin-bottom: var(--sp-2);">AI-powered morning briefs are coming in the next update.</p>
          <p class="text-xs text-muted">Daily therapy recommendations, meal plans, and insights — delivered automatically based on body state trends.</p>
        </div>
      </div>
    </div>

    <!-- QUICK ACTIONS -->
    <div style="margin-bottom: var(--sp-6);">
      <h3 style="margin-bottom: var(--sp-4);">Quick Actions</h3>
      <div class="grid-3">
        <button class="card-flat row gap-3" id="quickLogBtn" style="cursor: pointer; border: 1.5px solid var(--border); transition: all 0.15s;" onmouseover="this.style.borderColor='var(--teal)'" onmouseout="this.style.borderColor='var(--border)'">
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
        ${recentLogs.length > 0 ? recentLogs.slice(0, 5).map((l, i) => `
          <div class="row gap-4" style="padding: var(--sp-3) 0; ${i < Math.min(recentLogs.length, 5) - 1 ? 'border-bottom: 1px solid var(--border-light);' : ''}">
            <div class="icon-box icon-box-teal" style="width: 32px; height: 32px;">
              ${ICONS.heart}
            </div>
            <div style="flex: 1;">
              <p class="text-sm" style="color: var(--dark);">Body state logged — ${l.score}/100${l.notes ? ' · ' + l.notes : ''}</p>
              <p class="text-xs text-muted">${timeAgo(l.logged_at)}</p>
            </div>
          </div>
        `).join('') : `
          <div style="text-align: center; padding: var(--sp-6) 0;">
            <p class="text-sm text-muted">No activity yet. Log your first body state to get started.</p>
          </div>
        `}
      </div>
    </div>
  `;

  // Quick log button → navigate to body state
  document.getElementById('quickLogBtn')?.addEventListener('click', () => {
    location.hash = '#/body-state';
  });

  // Also wire the topbar quick log button
  document.getElementById('quickLog')?.addEventListener('click', () => {
    location.hash = '#/body-state';
  });

  // GSAP stagger animation
  if (typeof gsap !== 'undefined') {
    gsap.from(el.querySelectorAll('.card, .card-flat'), {
      y: 20, opacity: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out',
    });
  }
}

export function teardown() {}
