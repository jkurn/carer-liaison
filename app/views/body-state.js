/* ═══════════════════════════════════════════════════════════════
   Body State History — Health tracking view

   Layout:
   ┌──────────────────────────────────────────────────────────┐
   │  Body State History                        [Log State +] │
   ├──────────────────────────────────────────────────────────┤
   │                                                          │
   │  ┌─── Current ──┐  ┌── Avg ──┐  ┌── Best ──┐  ┌─ Low ─┐│
   │  │    72/100     │  │  71     │  │   82     │  │  58   ││
   │  └──────────────┘  └────────┘  └─────────┘  └───────┘ │
   │                                                          │
   │  ┌─── 30-Day Chart ─────────────────────────────────────┐│
   │  │  ████████████████████████████████████████████████    ││
   │  │  (SVG bar/line chart with hover tooltips)            ││
   │  └──────────────────────────────────────────────────────┘│
   │                                                          │
   │  ┌─── Log History (table) ──────────────────────────────┐│
   │  │  Date         Score    Notes           Trend         ││
   │  │  17 Mar 2026  72       Moderate day    ──            ││
   │  │  16 Mar 2026  78       Good morning    ↑             ││
   │  │  ...                                                 ││
   │  └──────────────────────────────────────────────────────┘│
   └──────────────────────────────────────────────────────────┘
   ═══════════════════════════════════════════════════════════════ */

import '../components/cl-gauge.js';
import '../components/cl-sparkline.js';

// Demo data — 30 days of body state logs
const DEMO_LOGS = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const score = Math.round(55 + Math.random() * 35);
  return {
    date,
    score,
    notes: score >= 75 ? 'Good day' : score >= 60 ? 'Moderate' : 'Tough day',
  };
});

function tierFor(score) {
  if (score >= 80) return { label: 'Great', cls: 'badge-green' };
  if (score >= 65) return { label: 'Good', cls: 'badge-teal' };
  if (score >= 50) return { label: 'Moderate', cls: 'badge-amber' };
  return { label: 'Low', cls: 'badge-coral' };
}

function fmtDate(d) {
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function trendArrow(current, previous) {
  if (!previous) return '—';
  const diff = current - previous;
  if (diff > 3) return `<span style="color: var(--green);">↑ +${diff}</span>`;
  if (diff < -3) return `<span style="color: var(--coral);">↓ ${diff}</span>`;
  return `<span style="color: var(--mid-gray);">→ ${diff >= 0 ? '+' : ''}${diff}</span>`;
}

export function render(el) {
  const logs = DEMO_LOGS;
  const current = logs[logs.length - 1];
  const scores = logs.map(l => l.score);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const best = Math.max(...scores);
  const low = Math.min(...scores);

  // SVG bar chart
  const chartW = 700;
  const chartH = 160;
  const barW = (chartW - 20) / logs.length - 2;
  const maxScore = 100;
  const bars = logs.map((l, i) => {
    const x = 10 + i * ((chartW - 20) / logs.length);
    const h = (l.score / maxScore) * (chartH - 20);
    const y = chartH - 10 - h;
    const tier = tierFor(l.score);
    const color = l.score >= 80 ? 'var(--green)' : l.score >= 65 ? 'var(--teal)' : l.score >= 50 ? 'var(--amber)' : 'var(--coral)';
    return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="${color}" opacity="0.7">
      <title>${fmtDate(l.date)}: ${l.score}/100 — ${l.notes}</title>
    </rect>`;
  }).join('');

  el.innerHTML = `
    <!-- HEADER -->
    <div class="row-between" style="margin-bottom: var(--sp-6);">
      <div>
        <h2>Body State History</h2>
        <p class="text-sm text-muted">Track physical capacity over time</p>
      </div>
      <button class="btn btn-primary btn-sm" id="logStateBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Log Body State
      </button>
    </div>

    <!-- STATS ROW -->
    <div class="grid-4" style="margin-bottom: var(--sp-6);">
      <div class="card" style="text-align: center;">
        <p class="text-xs text-muted" style="margin-bottom: var(--sp-1);">Current</p>
        <p class="metric">${current.score}</p>
        <span class="${tierFor(current.score).cls} badge" style="margin-top: var(--sp-2);">${tierFor(current.score).label}</span>
      </div>
      <div class="card" style="text-align: center;">
        <p class="text-xs text-muted" style="margin-bottom: var(--sp-1);">30-Day Average</p>
        <p class="metric">${avg}</p>
        <p class="text-xs text-muted" style="margin-top: var(--sp-2);">/100</p>
      </div>
      <div class="card" style="text-align: center;">
        <p class="text-xs text-muted" style="margin-bottom: var(--sp-1);">Best Day</p>
        <p class="metric" style="color: var(--green);">${best}</p>
        <p class="text-xs text-muted" style="margin-top: var(--sp-2);">/100</p>
      </div>
      <div class="card" style="text-align: center;">
        <p class="text-xs text-muted" style="margin-bottom: var(--sp-1);">Lowest</p>
        <p class="metric" style="color: var(--coral);">${low}</p>
        <p class="text-xs text-muted" style="margin-top: var(--sp-2);">/100</p>
      </div>
    </div>

    <!-- CHART -->
    <div class="card" style="margin-bottom: var(--sp-6);">
      <div class="row-between" style="margin-bottom: var(--sp-4);">
        <div class="eyebrow">30-Day Overview</div>
        <cl-sparkline values="${scores.join(',')}" width="100" height="28" color="var(--teal)"></cl-sparkline>
      </div>
      <div style="overflow-x: auto;">
        <svg width="${chartW}" height="${chartH}" viewBox="0 0 ${chartW} ${chartH}" style="width: 100%; height: auto;">
          <!-- Grid lines -->
          <line x1="10" y1="${chartH - 10 - (75/100) * (chartH - 20)}" x2="${chartW - 10}" y2="${chartH - 10 - (75/100) * (chartH - 20)}" stroke="var(--border-light)" stroke-dasharray="4"/>
          <line x1="10" y1="${chartH - 10 - (50/100) * (chartH - 20)}" x2="${chartW - 10}" y2="${chartH - 10 - (50/100) * (chartH - 20)}" stroke="var(--border-light)" stroke-dasharray="4"/>
          <text x="2" y="${chartH - 10 - (75/100) * (chartH - 20) + 4}" fill="var(--text-muted)" font-size="9">75</text>
          <text x="2" y="${chartH - 10 - (50/100) * (chartH - 20) + 4}" fill="var(--text-muted)" font-size="9">50</text>
          ${bars}
        </svg>
      </div>
    </div>

    <!-- LOG TABLE -->
    <div class="card">
      <div class="eyebrow" style="margin-bottom: var(--sp-4);">Recent Logs</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border);">
            <th style="text-align: left; padding: var(--sp-3) var(--sp-2); color: var(--mid-gray); font-weight: 500; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em;">Date</th>
            <th style="text-align: left; padding: var(--sp-3) var(--sp-2); color: var(--mid-gray); font-weight: 500; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em;">Score</th>
            <th style="text-align: left; padding: var(--sp-3) var(--sp-2); color: var(--mid-gray); font-weight: 500; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em;">Status</th>
            <th style="text-align: left; padding: var(--sp-3) var(--sp-2); color: var(--mid-gray); font-weight: 500; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em;">Notes</th>
            <th style="text-align: right; padding: var(--sp-3) var(--sp-2); color: var(--mid-gray); font-weight: 500; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em;">Trend</th>
          </tr>
        </thead>
        <tbody>
          ${logs.slice().reverse().slice(0, 14).map((l, i, arr) => {
            const prev = i < arr.length - 1 ? arr[i + 1] : null;
            const tier = tierFor(l.score);
            return `
              <tr style="border-bottom: 1px solid var(--border-light);">
                <td style="padding: var(--sp-3) var(--sp-2); color: var(--dark);">${fmtDate(l.date)}</td>
                <td style="padding: var(--sp-3) var(--sp-2); font-weight: 600; color: var(--dark);">${l.score}</td>
                <td style="padding: var(--sp-3) var(--sp-2);"><span class="badge ${tier.cls}">${tier.label}</span></td>
                <td style="padding: var(--sp-3) var(--sp-2); color: var(--mid-gray);">${l.notes}</td>
                <td style="padding: var(--sp-3) var(--sp-2); text-align: right; font-size: 0.82rem;">${trendArrow(l.score, prev ? prev.score : null)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Animate stat cards
  if (typeof gsap !== 'undefined') {
    gsap.from(el.querySelectorAll('.card'), {
      y: 20,
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out',
    });

    // Animate bar chart bars
    gsap.from(el.querySelectorAll('rect'), {
      scaleY: 0,
      transformOrigin: 'bottom',
      duration: 0.5,
      stagger: 0.015,
      ease: 'power2.out',
      delay: 0.3,
    });
  }
}

export function teardown() {}
