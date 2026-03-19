/* ═══════════════════════════════════════════════════════════════
   Settings — Account, notifications, consent (wired to Supabase)
   ═══════════════════════════════════════════════════════════════ */

import { supabase, getUser, getProfile, signOut } from '../lib/supabase.js';

export async function render(el) {
  el.innerHTML = `<div class="card" style="text-align:center;padding:var(--sp-12)"><p class="text-muted">Loading settings...</p></div>`;

  const user = await getUser();
  if (!user) return;

  const profile = await getProfile();
  if (!profile) { location.hash = '#/onboarding'; return; }

  // Fetch care pair
  const { data: carePairs } = await supabase
    .from('care_pairs')
    .select('*')
    .eq('carer_id', user.id)
    .limit(1);

  const carePair = carePairs?.[0] || null;
  const initials = profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  el.innerHTML = `
    <div style="max-width: 640px;">
      <div style="margin-bottom: var(--sp-6);">
        <h2>Settings</h2>
        <p class="text-sm text-muted">Manage your account, notifications, and consent preferences</p>
      </div>

      <div id="settingsMsg" class="text-sm" style="display:none; padding: var(--sp-3); border-radius: var(--r-sm); margin-bottom: var(--sp-4);"></div>

      <!-- PROFILE -->
      <form id="profileForm">
      <div class="card stack stack-4" style="margin-bottom: var(--sp-4);">
        <div class="eyebrow">Profile</div>
        <div class="row gap-4">
          <div class="avatar avatar-lg">${initials}</div>
          <div class="stack stack-2" style="flex: 1;">
            <div class="stack stack-2">
              <label class="label">Your name</label>
              <input type="text" class="input" id="setName" value="${profile.name}" placeholder="Your name">
            </div>
            <div class="stack stack-2">
              <label class="label">Email</label>
              <input type="email" class="input" value="${user.email}" disabled style="opacity: 0.6;">
            </div>
          </div>
        </div>
        <div class="stack stack-2">
          <label class="label">Your role</label>
          <select class="input" id="setRole" style="cursor: pointer;">
            <option value="primary_carer" ${profile.role === 'primary_carer' ? 'selected' : ''}>Primary Carer</option>
            <option value="participant" ${profile.role === 'participant' ? 'selected' : ''}>Participant</option>
            <option value="both" ${profile.role === 'both' ? 'selected' : ''}>Both (self-caring)</option>
          </select>
        </div>
        <div class="stack stack-2">
          <label class="label">Location</label>
          <input type="text" class="input" id="setLocation" value="${profile.location || ''}" placeholder="e.g., Parramatta, NSW">
        </div>
      </div>

      <!-- CARE PAIR -->
      <div class="card stack stack-4" style="margin-bottom: var(--sp-4);">
        <div class="eyebrow">Care Pair</div>
        <p class="text-sm text-muted">The person you care for. Both users have equal access to the system.</p>
        <div class="stack stack-2">
          <label class="label">Participant name</label>
          <input type="text" class="input" id="setPartName" value="${carePair?.participant_name || ''}" placeholder="Person you care for">
        </div>
        <div class="stack stack-2">
          <label class="label">NDIS number (optional)</label>
          <input type="text" class="input" id="setNdis" placeholder="e.g., 431 234 567" maxlength="11" value="${carePair?.ndis_number || ''}">
        </div>
      </div>

      <!-- NOTIFICATIONS -->
      <div class="card stack stack-4" style="margin-bottom: var(--sp-4);">
        <div class="eyebrow">Notifications</div>
        <div class="stack stack-2">
          <label class="label">Notification channel</label>
          <select class="input" id="setChannel" style="cursor: pointer;">
            <option value="email" ${profile.notification_channel === 'email' ? 'selected' : ''}>Email</option>
            <option value="whatsapp" ${profile.notification_channel === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
          </select>
        </div>
        <div class="stack stack-2">
          <label class="label">Morning brief time</label>
          <select class="input" id="setBriefHour" style="cursor: pointer;">
            ${[6, 7, 8, 9].map(h => `<option value="${h}" ${profile.morning_brief_hour === h ? 'selected' : ''}>${h}:00 AM</option>`).join('')}
          </select>
        </div>
      </div>

      <button type="submit" class="btn btn-primary" id="saveSettingsBtn" style="margin-bottom: var(--sp-6);">
        Save Changes
      </button>
      </form>

      <!-- CONSENT -->
      <div class="card stack stack-4" style="margin-bottom: var(--sp-4);">
        <div class="eyebrow">Data & Consent</div>
        <p class="text-sm text-muted">Both carer and participant can view these settings. Changes are logged for safety.</p>
        <div class="row-between" style="padding: var(--sp-2) 0; border-bottom: 1px solid var(--border-light);">
          <div>
            <p style="font-weight: 500; color: var(--dark); font-size: 0.9rem;">Data stored in Australia only</p>
            <p class="text-xs text-muted">AU-hosted Supabase</p>
          </div>
          <span class="badge badge-green"><span class="badge-dot"></span> Active</span>
        </div>
        <div class="row-between" style="padding: var(--sp-2) 0;">
          <div>
            <p style="font-weight: 500; color: var(--dark); font-size: 0.9rem;">Crisis alerts</p>
            <p class="text-xs text-muted">Mandatory — cannot be disabled</p>
          </div>
          <span class="badge badge-coral"><span class="badge-dot"></span> Always on</span>
        </div>
      </div>

      <!-- SIGN OUT + DANGER -->
      <div class="card stack stack-4" style="border: 1px solid var(--coral);">
        <div class="eyebrow" style="color: var(--coral);">Account</div>
        <div class="row-between">
          <div>
            <p style="font-weight: 500; color: var(--dark); font-size: 0.9rem;">Sign out</p>
            <p class="text-xs text-muted">Sign out of this device</p>
          </div>
          <button class="btn btn-secondary btn-sm" id="signOutBtn">Sign Out</button>
        </div>
      </div>
    </div>
  `;

  // Save settings
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('settingsMsg');
    const btn = document.getElementById('saveSettingsBtn');
    msgEl.style.display = 'none';

    btn.disabled = true;
    btn.textContent = 'Saving...';

    // Update profile
    const { error: profileErr } = await supabase.from('profiles').update({
      name: document.getElementById('setName').value.trim(),
      role: document.getElementById('setRole').value,
      location: document.getElementById('setLocation').value.trim() || null,
      notification_channel: document.getElementById('setChannel').value,
      morning_brief_hour: parseInt(document.getElementById('setBriefHour').value),
    }).eq('id', user.id);

    if (profileErr) {
      msgEl.textContent = 'Failed to save: ' + profileErr.message;
      msgEl.style.background = 'var(--red-bg)';
      msgEl.style.color = 'var(--red)';
      msgEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Save Changes';
      return;
    }

    // Update care pair if exists
    if (carePair) {
      await supabase.from('care_pairs').update({
        participant_name: document.getElementById('setPartName').value.trim(),
        ndis_number: document.getElementById('setNdis').value.trim() || null,
      }).eq('id', carePair.id);
    }

    // Update sidebar name
    const userName = document.getElementById('userName');
    if (userName) userName.textContent = document.getElementById('setName').value.trim();

    msgEl.textContent = 'Settings saved successfully.';
    msgEl.style.background = 'var(--green-bg)';
    msgEl.style.color = 'var(--green)';
    msgEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  });

  // Sign out
  document.getElementById('signOutBtn').addEventListener('click', () => signOut());
}

export function teardown() {}
