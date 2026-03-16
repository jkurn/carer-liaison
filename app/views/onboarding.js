/* ═══════════════════════════════════════════════════════════════
   Onboarding — New user setup flow

   Based on Pencil design: teal sidebar with steps + form card.
   Equal dual-user model: collects both carer and participant info.

   Steps:
   1. About You (carer info)
   2. Who You Care For (participant info)
   3. Preferences (notifications, consent)

   ┌────────────────────────────────────────────────────────────┐
   │  ┌─── Sidebar ──┐  ┌────── Form Card ──────────────────┐ │
   │  │ ① About You  │  │ Let's set up your care pair       │ │
   │  │ ② Care For   │  │                                   │ │
   │  │ ③ Prefs      │  │ [Your name          ]             │ │
   │  │              │  │ [Your email         ]             │ │
   │  │              │  │ [Your role ▾        ]             │ │
   │  │              │  │                                   │ │
   │  │              │  │              [Continue →]          │ │
   │  └──────────────┘  └───────────────────────────────────┘ │
   └────────────────────────────────────────────────────────────┘
   ═══════════════════════════════════════════════════════════════ */

const STEPS = [
  { id: 'about', label: 'About You', icon: '①' },
  { id: 'careFor', label: 'Who You Care For', icon: '②' },
  { id: 'prefs', label: 'Preferences', icon: '③' },
];

let currentStep = 0;

function renderStep(step) {
  if (step === 0) {
    return `
      <h2 style="margin-bottom: var(--sp-2);">Let's get you set up</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--sp-6);">
        Tell us about yourself. This helps us tailor the experience to your caring situation.
      </p>
      <div class="stack stack-4">
        <div class="stack stack-2">
          <label class="label" for="obName">Your name *</label>
          <input type="text" class="input" id="obName" placeholder="e.g., Sarah Chen" required>
        </div>
        <div class="stack stack-2">
          <label class="label" for="obEmail">Email address *</label>
          <input type="email" class="input" id="obEmail" placeholder="you@example.com" required>
        </div>
        <div class="stack stack-2">
          <label class="label" for="obRole">Your role</label>
          <select class="input" id="obRole" style="cursor: pointer;">
            <option value="primary_carer" selected>Primary Carer</option>
            <option value="participant">Participant (I care for myself)</option>
            <option value="both">Both — carer and participant</option>
          </select>
        </div>
        <div class="stack stack-2">
          <label class="label" for="obLocation">Your location</label>
          <input type="text" class="input" id="obLocation" placeholder="e.g., Parramatta, NSW">
        </div>
      </div>
    `;
  }

  if (step === 1) {
    return `
      <h2 style="margin-bottom: var(--sp-2);">Who do you care for?</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--sp-6);">
        Tell us about the person you support. They'll also have full access to the system — you're equal partners.
      </p>
      <div class="stack stack-4">
        <div class="stack stack-2">
          <label class="label" for="obPartName">Their name *</label>
          <input type="text" class="input" id="obPartName" placeholder="e.g., Alex Chen" required>
        </div>
        <div class="stack stack-2">
          <label class="label" for="obPartNdis">NDIS number (optional)</label>
          <input type="text" class="input" id="obPartNdis" placeholder="e.g., 431 234 567">
          <p class="text-xs text-muted">We use this to help with NDIS plan references. Stored securely.</p>
        </div>
        <div class="stack stack-2">
          <label class="label">Primary support needs</label>
          <div class="grid-2" style="gap: var(--sp-2);" id="needsGrid">
            ${['Physical support', 'Daily living', 'Therapy coordination', 'Meal planning',
               'Health monitoring', 'Social participation', 'Communication', 'Transport']
              .map(need => `
                <label class="card-flat row gap-3" style="cursor: pointer; padding: var(--sp-3);">
                  <input type="checkbox" style="accent-color: var(--teal); width: 16px; height: 16px;">
                  <span class="text-sm" style="color: var(--dark);">${need}</span>
                </label>
              `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (step === 2) {
    return `
      <h2 style="margin-bottom: var(--sp-2);">Almost done — preferences</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--sp-6);">
        Choose how you'd like Carer Liaison to communicate with you. You can change these anytime.
      </p>
      <div class="stack stack-4">
        <div class="stack stack-2">
          <label class="label">How should we reach you?</label>
          <div class="stack stack-2">
            <label class="card-flat row gap-3" style="cursor: pointer; padding: var(--sp-3);">
              <input type="radio" name="channel" value="whatsapp" checked style="accent-color: var(--teal);">
              <div>
                <p class="text-sm" style="color: var(--dark); font-weight: 500;">WhatsApp</p>
                <p class="text-xs text-muted">Morning briefs, body state reminders, alerts</p>
              </div>
            </label>
            <label class="card-flat row gap-3" style="cursor: pointer; padding: var(--sp-3);">
              <input type="radio" name="channel" value="email" style="accent-color: var(--teal);">
              <div>
                <p class="text-sm" style="color: var(--dark); font-weight: 500;">Email only</p>
                <p class="text-xs text-muted">All notifications via email</p>
              </div>
            </label>
          </div>
        </div>

        <div class="stack stack-2">
          <label class="label">Morning brief time</label>
          <select class="input" style="cursor: pointer;">
            <option value="6">6:00 AM</option>
            <option value="7" selected>7:00 AM</option>
            <option value="8">8:00 AM</option>
            <option value="9">9:00 AM</option>
          </select>
        </div>

        <!-- Consent acknowledgment -->
        <div class="card-surface stack stack-3" style="padding: var(--sp-4);">
          <p class="text-sm" style="color: var(--dark); font-weight: 500;">Data & Privacy</p>
          <label class="row gap-3" style="cursor: pointer;">
            <input type="checkbox" id="consentCheck" style="accent-color: var(--teal); width: 16px; height: 16px; flex-shrink: 0;">
            <span class="text-xs text-muted">
              I understand that all data is stored in Australia, both carer and participant have equal access,
              and crisis alerts are always active and cannot be disabled.
            </span>
          </label>
        </div>
      </div>
    `;
  }

  return '';
}

export function render(el) {
  currentStep = 0;

  function update() {
    el.innerHTML = `
      <div style="display: flex; gap: var(--sp-6); min-height: calc(100vh - var(--nav-height) - var(--sp-12)); align-items: stretch;">

        <!-- STEP SIDEBAR -->
        <div style="width: 220px; flex-shrink: 0; background: linear-gradient(180deg, var(--teal), var(--teal-dark)); border-radius: var(--r-lg); padding: var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-4);">
          <p style="color: rgba(255,255,255,0.7); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600;">Setup</p>
          ${STEPS.map((s, i) => `
            <div class="row gap-3" style="padding: var(--sp-2) 0; opacity: ${i <= currentStep ? 1 : 0.5};">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: ${i < currentStep ? 'rgba(255,255,255,0.3)' : i === currentStep ? 'white' : 'rgba(255,255,255,0.15)'}; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: ${i === currentStep ? 'var(--teal)' : 'white'};">
                ${i < currentStep ? '✓' : i + 1}
              </div>
              <span style="font-size: 0.85rem; color: white; font-weight: ${i === currentStep ? 600 : 400};">${s.label}</span>
            </div>
          `).join('')}
          <div style="flex: 1;"></div>
          <p style="color: rgba(255,255,255,0.5); font-size: 0.72rem;">Step ${currentStep + 1} of ${STEPS.length}</p>
        </div>

        <!-- FORM AREA -->
        <div class="card" style="flex: 1; display: flex; flex-direction: column;">
          <div style="flex: 1;">
            ${renderStep(currentStep)}
          </div>

          <!-- NAVIGATION -->
          <div class="row-between" style="margin-top: var(--sp-8); padding-top: var(--sp-4); border-top: 1px solid var(--border-light);">
            <button class="btn btn-ghost" id="obBack" ${currentStep === 0 ? 'style="visibility: hidden;"' : ''}>
              ← Back
            </button>
            <button class="btn btn-primary" id="obNext">
              ${currentStep === STEPS.length - 1 ? 'Complete Setup →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Wire navigation
    document.getElementById('obBack')?.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        update();
      }
    });

    document.getElementById('obNext')?.addEventListener('click', () => {
      if (currentStep < STEPS.length - 1) {
        currentStep++;
        update();
      } else {
        // Complete — go to dashboard
        // TODO: POST to Supabase, create profile + care_pair
        location.hash = '#/';
      }
    });

    // Animate form entrance
    if (typeof gsap !== 'undefined') {
      gsap.from(el.querySelector('.card'), {
        y: 16,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out',
      });
    }
  }

  update();
}

export function teardown() {
  currentStep = 0;
}
