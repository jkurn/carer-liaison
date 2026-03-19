/* ═══════════════════════════════════════════════════════════════
   Body State History — Health tracking (wired to Supabase)

   Features:
   - Log new body state (0-100 slider + notes)
   - View 30-day chart
   - Stats: current, avg, best, lowest
   - Log history table
   ═══════════════════════════════════════════════════════════════ */

import '../components/cl-gauge.js';
import '../components/cl-sparkline.js';
import { supabase, getUser } from '../lib/supabase.js';

function tierFor(score) {
  if (score >= 80) return { label: 'Great', cls: 'badge-green' };
  if (score >= 65) return { label: 'Good', cls: 'badge-teal' };
  if (score >= 50) return { label: 'Moderate', cls: 'badge-amber' };
  return { label: 'Low', cls: 'badge-coral' };
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function trendArrow(current, previous) {
  if (previous == null) return '—';
  const diff = current - previous;
  if (diff > 3) return `<span style="color: var(--green);">&uarr; +${diff}</span>`;
  if (diff < -3) return `<span style="color: var(--coral);">&darr; ${diff}</span>`;
  return `<span style="color: var(--mid-gray);">&rarr; ${diff >= 0 ? '+' : ''}${diff}</span>`;
}

export async function render(el) {
  el.innerHTML = `<div class="card" style="text-align:center;padding:var(--sp-12)"><p class="text-muted">Loading body state data...</p></div>`;

  const user = await getUser();
  if (!user) return;

  // Fetch last 30 logs
  const { data: logs, error } = await supabase
    .from('body_state_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: true })
    .limit(30);

  if (error) {
    el.innerHTML = `<div class="card"><p style="color:var(--red);">Failed to load data: ${error.message}</p></div>`;
    return;
  }

  const allLogs = logs || [];
  const current = allLogs[allLogs.length - 1] || null;
  const scores = allLogs.map(l => l.score);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const best = scores.length ? Math.max(...scores) : 0;
  const low = scores.length ? Math.min(...scores) : 0;

  // SVG bar chart
  const chartW = 700;
  const chartH = 160;
  const maxScore = 100;
  const bars = allLogs.length > 0 ? allLogs.map((l, i) => {
    const barW = Math.max(4, (chartW - 20) / allLogs.length - 2);
    const x = 10 + i * ((chartW - 20) / allLogs.length);
    const h = (l.score / maxScore) * (chartH - 20);
    const y = chartH - 10 - h;
    const color = l.score >= 80 ? 'var(--green)' : l.score >= 65 ? 'var(--teal)' : l.score >= 50 ? 'var(--amber)' : 'var(--coral)';
    return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="${color}" opacity="0.7">
      <title>${fmtDate(l.logged_at)}: ${l.score}/100 — ${l.notes || 'No notes'}</title>
    </rect>`;
  }).join('') : '';

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

    <!-- LOG MODAL (hidden) -->
    <div id="logModal" class="card" style="display:none; margin-bottom: var(--sp-6); border: 2px solid var(--teal);">
      <div class="eyebrow" style="margin-bottom: var(--sp-4);">New Body State Log</div>
      <div class="stack stack-4">
        <div class="stack stack-2">
          <label class="label">How is your body feeling? <strong id="sliderValue">50</strong>/100</label>
          <input type="range" id="scoreSlider" min="0" max="100" value="50" style="width:100%; accent-color: var(--teal);">
          <div class="row-between text-xs text-muted">
            <span>Struggling</span>
            <span>Moderate</span>
            <span>Great</span>
          </div>
        </div>
        <div class="stack stack-2">
          <label class="label" for="logNotes">Notes (optional)</label>
          <input type="text" class="input" id="logNotes" placeholder="e.g., Shoulder pain, slept well...">
        </div>
        <div class="row gap-3">
          <button class="btn btn-primary" id="saveLogBtn">Save Log</button>
          <button class="btn btn-ghost" id="cancelLogBtn">Cancel</button>
        </div>
        <div id="logError" class="text-sm" style="color:var(--red);display:none;"></div>
      </div>
    </div>

    ${allLogs.length > 0 ? `
    <!-- STATS ROW -->
    <div class="grid-4" style="margin-bottom: var(--sp-6);">
      <div class="card" style="text-align: center;">
        <p class="text-xs text-muted" style="margin-bottom: var(--sp-1);">Current</p>
        <p class="metric">${current.score}</p>
        <span class="${tierFor(current.score).cls} badge" style="margin-top: var(--sp-2);">${tierFor(current.score).label}</span>
      </div>
      <div class="card" style="text-align: center;">
        <p class="text-xs text-muted" style="margin-bottom: var(--sp-1);">Average</p>
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
        ${scores.length > 1 ? `<cl-sparkline values="${scores.join(',')}" width="100" height="28" color="var(--teal)"></cl-sparkline>` : ''}
      </div>
      <div style="overflow-x: auto;">
        <svg width="${chartW}" height="${chartH}" viewBox="0 0 ${chartW} ${chartH}" style="width: 100%; height: auto;">
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
          ${allLogs.slice().reverse().slice(0, 14).map((l, i, arr) => {
            const prev = i < arr.length - 1 ? arr[i + 1] : null;
            const tier = tierFor(l.score);
            return `
              <tr style="border-bottom: 1px solid var(--border-light);">
                <td style="padding: var(--sp-3) var(--sp-2); color: var(--dark);">${fmtDate(l.logged_at)}</td>
                <td style="padding: var(--sp-3) var(--sp-2); font-weight: 600; color: var(--dark);">${l.score}</td>
                <td style="padding: var(--sp-3) var(--sp-2);"><span class="badge ${tier.cls}">${tier.label}</span></td>
                <td style="padding: var(--sp-3) var(--sp-2); color: var(--mid-gray);">${l.notes || '—'}</td>
                <td style="padding: var(--sp-3) var(--sp-2); text-align: right; font-size: 0.82rem;">${trendArrow(l.score, prev ? prev.score : null)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    ` : `
    <!-- EMPTY STATE -->
    <div class="card" style="text-align: center; padding: var(--sp-12);">
      <div style="font-size: 2.5rem; margin-bottom: var(--sp-4);">🫀</div>
      <h3 style="margin-bottom: var(--sp-2);">No body state data yet</h3>
      <p class="text-sm text-muted" style="margin-bottom: var(--sp-6); max-width: 400px; margin-left: auto; margin-right: auto;">
        Start tracking how the person you care for is feeling each day. Over time, you'll see patterns that help plan better care.
      </p>
      <button class="btn btn-primary" id="emptyLogBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Log First Body State
      </button>
    </div>
    `}
  `;

  // Wire log modal
  const modal = document.getElementById('logModal');
  const slider = document.getElementById('scoreSlider');
  const sliderVal = document.getElementById('sliderValue');

  function showModal() {
    modal.style.display = '';
    modal.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.getElementById('logStateBtn')?.addEventListener('click', showModal);
  document.getElementById('emptyLogBtn')?.addEventListener('click', showModal);
  document.getElementById('cancelLogBtn')?.addEventListener('click', () => { modal.style.display = 'none'; });

  slider?.addEventListener('input', () => { sliderVal.textContent = slider.value; });

  document.getElementById('saveLogBtn')?.addEventListener('click', async () => {
    const score = parseInt(slider.value);
    const notes = document.getElementById('logNotes').value.trim();
    const errEl = document.getElementById('logError');
    const btn = document.getElementById('saveLogBtn');
    errEl.style.display = 'none';

    btn.disabled = true;
    btn.textContent = 'Saving...';

    const { error: insertError } = await supabase.from('body_state_logs').insert({
      user_id: user.id,
      score,
      notes: notes || null,
    });

    if (insertError) {
      errEl.textContent = 'Failed to save: ' + insertError.message;
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Save Log';
      return;
    }

    // Re-render the view with new data
    await render(el);
  });

  // Animate
  if (typeof gsap !== 'undefined') {
    gsap.from(el.querySelectorAll('.card'), {
      y: 20, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out',
    });
    if (allLogs.length > 0) {
      gsap.from(el.querySelectorAll('rect'), {
        scaleY: 0, transformOrigin: 'bottom', duration: 0.5, stagger: 0.015, ease: 'power2.out', delay: 0.3,
      });
    }
  }
}

export function teardown() {}
