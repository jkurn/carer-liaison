/* Settings view — placeholder for account and consent management */

export function render(el) {
  el.innerHTML = `
    <div style="max-width: 640px;">
      <div style="margin-bottom: var(--sp-6);">
        <h2>Settings</h2>
        <p class="text-sm text-muted">Manage your account, notifications, and consent preferences</p>
      </div>

      <!-- PROFILE -->
      <div class="card stack stack-4" style="margin-bottom: var(--sp-4);">
        <div class="eyebrow">Profile</div>
        <div class="row gap-4">
          <div class="avatar avatar-lg">SC</div>
          <div class="stack stack-2" style="flex: 1;">
            <div class="stack stack-2">
              <label class="label">Your name</label>
              <input type="text" class="input" value="Sarah Chen" placeholder="Your name">
            </div>
            <div class="stack stack-2">
              <label class="label">Email</label>
              <input type="email" class="input" value="sarah@example.com" disabled style="opacity: 0.6;">
            </div>
          </div>
        </div>
        <div class="stack stack-2">
          <label class="label">Your role</label>
          <select class="input" style="cursor: pointer;">
            <option selected>Primary Carer</option>
            <option>Participant</option>
            <option>Both (self-caring)</option>
          </select>
        </div>
      </div>

      <!-- CARE PAIR -->
      <div class="card stack stack-4" style="margin-bottom: var(--sp-4);">
        <div class="eyebrow">Care Pair</div>
        <p class="text-sm text-muted">The person you care for. Both users have equal access to the system.</p>
        <div class="stack stack-2">
          <label class="label">Participant name</label>
          <input type="text" class="input" value="Alex Chen" placeholder="Person you care for">
        </div>
        <div class="stack stack-2">
          <label class="label">NDIS number (optional)</label>
          <input type="text" class="input" placeholder="e.g., 431 234 567" maxlength="11">
        </div>
      </div>

      <!-- NOTIFICATIONS -->
      <div class="card stack stack-4" style="margin-bottom: var(--sp-4);">
        <div class="eyebrow">Notifications</div>
        <div class="row-between" style="padding: var(--sp-2) 0; border-bottom: 1px solid var(--border-light);">
          <div>
            <p style="font-weight: 500; color: var(--dark); font-size: 0.9rem;">Morning brief</p>
            <p class="text-xs text-muted">Daily health summary at 7am</p>
          </div>
          <label style="cursor: pointer;">
            <input type="checkbox" checked style="accent-color: var(--teal); width: 18px; height: 18px;">
          </label>
        </div>
        <div class="row-between" style="padding: var(--sp-2) 0; border-bottom: 1px solid var(--border-light);">
          <div>
            <p style="font-weight: 500; color: var(--dark); font-size: 0.9rem;">Body state reminders</p>
            <p class="text-xs text-muted">Nudge if no log by 10am</p>
          </div>
          <label style="cursor: pointer;">
            <input type="checkbox" checked style="accent-color: var(--teal); width: 18px; height: 18px;">
          </label>
        </div>
        <div class="row-between" style="padding: var(--sp-2) 0;">
          <div>
            <p style="font-weight: 500; color: var(--dark); font-size: 0.9rem;">Weekly report</p>
            <p class="text-xs text-muted">Summary every Sunday evening</p>
          </div>
          <label style="cursor: pointer;">
            <input type="checkbox" checked style="accent-color: var(--teal); width: 18px; height: 18px;">
          </label>
        </div>
      </div>

      <!-- CONSENT (Safeguarding) -->
      <div class="card stack stack-4" style="margin-bottom: var(--sp-4);">
        <div class="eyebrow">Data & Consent</div>
        <p class="text-sm text-muted">
          Both carer and participant can view these settings. Changes are logged for safety.
        </p>
        <div class="row-between" style="padding: var(--sp-2) 0; border-bottom: 1px solid var(--border-light);">
          <div>
            <p style="font-weight: 500; color: var(--dark); font-size: 0.9rem;">Share body state with carer</p>
            <p class="text-xs text-muted">Participant controls this</p>
          </div>
          <label style="cursor: pointer;">
            <input type="checkbox" checked style="accent-color: var(--teal); width: 18px; height: 18px;">
          </label>
        </div>
        <div class="row-between" style="padding: var(--sp-2) 0; border-bottom: 1px solid var(--border-light);">
          <div>
            <p style="font-weight: 500; color: var(--dark); font-size: 0.9rem;">Data stored in Australia only</p>
            <p class="text-xs text-muted">AU-hosted Supabase + Bedrock Sydney</p>
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

      <!-- DANGER ZONE -->
      <div class="card stack stack-4" style="border: 1px solid var(--coral);">
        <div class="eyebrow" style="color: var(--coral);">Danger Zone</div>
        <div class="row-between">
          <div>
            <p style="font-weight: 500; color: var(--dark); font-size: 0.9rem;">Export all data</p>
            <p class="text-xs text-muted">Download everything as JSON</p>
          </div>
          <button class="btn btn-secondary btn-sm">Export</button>
        </div>
        <div class="row-between">
          <div>
            <p style="font-weight: 500; color: var(--dark); font-size: 0.9rem;">Delete account</p>
            <p class="text-xs text-muted">Permanently remove all data</p>
          </div>
          <button class="btn btn-sm" style="background: var(--red); color: white;">Delete</button>
        </div>
      </div>
    </div>
  `;
}

export function teardown() {}
