/* ═══════════════════════════════════════════════════════════════
   Onboarding — New user setup flow (wired to Supabase)

   Steps:
   1. About You (carer info) → INSERT profiles
   2. Who You Care For → INSERT care_pairs
   3. Preferences → UPDATE profiles (notification prefs)

   Form state persisted in `formData` object across step transitions.
   ═══════════════════════════════════════════════════════════════ */

import { supabase, getUser } from '../lib/supabase.js';

const STEPS = [
  { id: 'about', label: 'About You', icon: '1' },
  { id: 'careFor', label: 'Who You Care For', icon: '2' },
  { id: 'prefs', label: 'Preferences', icon: '3' },
];

let currentStep = 0;

// Persistent form data across steps
const formData = {
  name: '',
  email: '',
  role: 'primary_carer',
  location: '',
  participantName: '',
  ndisNumber: '',
  supportNeeds: [],
  notificationChannel: 'email',
  morningBriefHour: 7,
  consent: false,
};

function collectCurrentStep() {
  if (currentStep === 0) {
    formData.name = document.getElementById('obName')?.value || formData.name;
    formData.email = document.getElementById('obEmail')?.value || formData.email;
    formData.role = document.getElementById('obRole')?.value || formData.role;
    formData.location = document.getElementById('obLocation')?.value || formData.location;
  } else if (currentStep === 1) {
    formData.participantName = document.getElementById('obPartName')?.value || formData.participantName;
    formData.ndisNumber = document.getElementById('obPartNdis')?.value || formData.ndisNumber;
    const checkboxes = document.querySelectorAll('#needsGrid input[type="checkbox"]');
    formData.supportNeeds = [];
    checkboxes.forEach(cb => {
      if (cb.checked) {
        formData.supportNeeds.push(cb.closest('label').querySelector('span').textContent.trim());
      }
    });
  } else if (currentStep === 2) {
    const channel = document.querySelector('input[name="channel"]:checked');
    formData.notificationChannel = channel?.value || 'email';
    const briefHour = document.querySelector('#obBriefHour');
    formData.morningBriefHour = parseInt(briefHour?.value || '7');
    formData.consent = document.getElementById('consentCheck')?.checked || false;
  }
}

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
          <input type="text" class="input" id="obName" placeholder="e.g., Sarah Chen" required value="${formData.name}">
        </div>
        <div class="stack stack-2">
          <label class="label" for="obEmail">Email address</label>
          <input type="email" class="input" id="obEmail" value="${formData.email}" disabled style="opacity: 0.6;">
          <p class="text-xs text-muted">From your sign-up. Can't be changed here.</p>
        </div>
        <div class="stack stack-2">
          <label class="label" for="obRole">Your role</label>
          <select class="input" id="obRole" style="cursor: pointer;">
            <option value="primary_carer" ${formData.role === 'primary_carer' ? 'selected' : ''}>Primary Carer</option>
            <option value="participant" ${formData.role === 'participant' ? 'selected' : ''}>Participant (I care for myself)</option>
            <option value="both" ${formData.role === 'both' ? 'selected' : ''}>Both — carer and participant</option>
          </select>
        </div>
        <div class="stack stack-2">
          <label class="label" for="obLocation">Your location</label>
          <input type="text" class="input" id="obLocation" placeholder="e.g., Parramatta, NSW" value="${formData.location}">
        </div>
      </div>
    `;
  }

  if (step === 1) {
    const needs = ['Physical support', 'Daily living', 'Therapy coordination', 'Meal planning',
                   'Health monitoring', 'Social participation', 'Communication', 'Transport'];
    return `
      <h2 style="margin-bottom: var(--sp-2);">Who do you care for?</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--sp-6);">
        Tell us about the person you support. They'll also have full access to the system — you're equal partners.
      </p>
      <div class="stack stack-4">
        <div class="stack stack-2">
          <label class="label" for="obPartName">Their name *</label>
          <input type="text" class="input" id="obPartName" placeholder="e.g., Alex Chen" required value="${formData.participantName}">
        </div>
        <div class="stack stack-2">
          <label class="label" for="obPartNdis">NDIS number (optional)</label>
          <input type="text" class="input" id="obPartNdis" placeholder="e.g., 431 234 567" value="${formData.ndisNumber}">
          <p class="text-xs text-muted">We use this to help with NDIS plan references. Stored securely.</p>
        </div>
        <div class="stack stack-2">
          <label class="label">Primary support needs</label>
          <div class="grid-2" style="gap: var(--sp-2);" id="needsGrid">
            ${needs.map(need => `
              <label class="card-flat row gap-3" style="cursor: pointer; padding: var(--sp-3);">
                <input type="checkbox" style="accent-color: var(--teal); width: 16px; height: 16px;"
                  ${formData.supportNeeds.includes(need) ? 'checked' : ''}>
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
              <input type="radio" name="channel" value="whatsapp" ${formData.notificationChannel === 'whatsapp' ? 'checked' : ''} style="accent-color: var(--teal);">
              <div>
                <p class="text-sm" style="color: var(--dark); font-weight: 500;">WhatsApp</p>
                <p class="text-xs text-muted">Morning briefs, body state reminders, alerts</p>
              </div>
            </label>
            <label class="card-flat row gap-3" style="cursor: pointer; padding: var(--sp-3);">
              <input type="radio" name="channel" value="email" ${formData.notificationChannel === 'email' ? 'checked' : ''} style="accent-color: var(--teal);">
              <div>
                <p class="text-sm" style="color: var(--dark); font-weight: 500;">Email only</p>
                <p class="text-xs text-muted">All notifications via email</p>
              </div>
            </label>
          </div>
        </div>

        <div class="stack stack-2">
          <label class="label" for="obBriefHour">Morning brief time</label>
          <select class="input" id="obBriefHour" style="cursor: pointer;">
            ${[6, 7, 8, 9].map(h => `<option value="${h}" ${formData.morningBriefHour === h ? 'selected' : ''}>${h}:00 AM</option>`).join('')}
          </select>
        </div>

        <div class="card-surface stack stack-3" style="padding: var(--sp-4);">
          <p class="text-sm" style="color: var(--dark); font-weight: 500;">Data & Privacy</p>
          <label class="row gap-3" style="cursor: pointer;">
            <input type="checkbox" id="consentCheck" ${formData.consent ? 'checked' : ''} style="accent-color: var(--teal); width: 16px; height: 16px; flex-shrink: 0;">
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

export async function render(el) {
  currentStep = 0;

  // Pre-fill email from auth
  const user = await getUser();
  if (user) formData.email = user.email || '';

  async function update() {
    el.innerHTML = `
      <div style="display: flex; gap: var(--sp-6); min-height: calc(100vh - var(--nav-height) - var(--sp-12)); align-items: stretch;">

        <!-- STEP SIDEBAR -->
        <div style="width: 220px; flex-shrink: 0; background: linear-gradient(180deg, var(--teal), var(--teal-dark)); border-radius: var(--r-lg); padding: var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-4);">
          <p style="color: rgba(255,255,255,0.7); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600;">Setup</p>
          ${STEPS.map((s, i) => `
            <div class="row gap-3" style="padding: var(--sp-2) 0; opacity: ${i <= currentStep ? 1 : 0.5};">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: ${i < currentStep ? 'rgba(255,255,255,0.3)' : i === currentStep ? 'white' : 'rgba(255,255,255,0.15)'}; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: ${i === currentStep ? 'var(--teal)' : 'white'};">
                ${i < currentStep ? '&#10003;' : i + 1}
              </div>
              <span style="font-size: 0.85rem; color: white; font-weight: ${i === currentStep ? 600 : 400};">${s.label}</span>
            </div>
          `).join('')}
          <div style="flex: 1;"></div>
          <p style="color: rgba(255,255,255,0.5); font-size: 0.72rem;">Step ${currentStep + 1} of ${STEPS.length}</p>
        </div>

        <!-- FORM AREA -->
        <div class="card" style="flex: 1; display: flex; flex-direction: column;">
          <div style="flex: 1;" id="stepContent">
            ${renderStep(currentStep)}
          </div>

          <div id="obError" class="text-sm" style="color: var(--red); display: none; padding: var(--sp-3); background: var(--red-bg); border-radius: var(--r-sm); margin-top: var(--sp-4);"></div>

          <!-- NAVIGATION -->
          <div class="row-between" style="margin-top: var(--sp-8); padding-top: var(--sp-4); border-top: 1px solid var(--border-light);">
            <button class="btn btn-ghost" id="obBack" ${currentStep === 0 ? 'style="visibility: hidden;"' : ''}>
              &larr; Back
            </button>
            <button class="btn btn-primary" id="obNext">
              ${currentStep === STEPS.length - 1 ? 'Complete Setup &rarr;' : 'Continue &rarr;'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Wire navigation
    document.getElementById('obBack')?.addEventListener('click', () => {
      if (currentStep > 0) {
        collectCurrentStep();
        currentStep--;
        update();
      }
    });

    document.getElementById('obNext')?.addEventListener('click', async () => {
      collectCurrentStep();
      const errorEl = document.getElementById('obError');
      errorEl.style.display = 'none';

      // Validation
      if (currentStep === 0 && !formData.name.trim()) {
        errorEl.textContent = 'Please enter your name.';
        errorEl.style.display = 'block';
        return;
      }
      if (currentStep === 1 && !formData.participantName.trim()) {
        errorEl.textContent = 'Please enter the name of the person you care for.';
        errorEl.style.display = 'block';
        return;
      }
      if (currentStep === 2 && !formData.consent) {
        errorEl.textContent = 'Please acknowledge the data and privacy terms.';
        errorEl.style.display = 'block';
        return;
      }

      if (currentStep < STEPS.length - 1) {
        currentStep++;
        update();
      } else {
        // Complete — save to Supabase
        const btn = document.getElementById('obNext');
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.textContent = 'Saving...';

        const user = await getUser();
        if (!user) { location.hash = '#/login'; return; }

        // Insert profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          name: formData.name.trim(),
          role: formData.role,
          location: formData.location.trim() || null,
          notification_channel: formData.notificationChannel,
          morning_brief_hour: formData.morningBriefHour,
        });

        if (profileError) {
          errorEl.textContent = 'Failed to save profile: ' + profileError.message;
          errorEl.style.display = 'block';
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.innerHTML = 'Complete Setup &rarr;';
          return;
        }

        // Insert care pair
        if (formData.participantName.trim()) {
          const { error: pairError } = await supabase.from('care_pairs').insert({
            carer_id: user.id,
            participant_name: formData.participantName.trim(),
            ndis_number: formData.ndisNumber.trim() || null,
            support_needs: formData.supportNeeds,
          });

          if (pairError) {
            console.error('Care pair insert error:', pairError);
            // Non-blocking — profile was saved, care pair can be added later
          }
        }

        location.hash = '#/';
      }
    });

    // Animate form entrance
    if (typeof gsap !== 'undefined') {
      gsap.from(el.querySelector('.card'), {
        y: 16, opacity: 0, duration: 0.35, ease: 'power2.out',
      });
    }
  }

  update();
}

export function teardown() {
  currentStep = 0;
  // Reset form data
  Object.assign(formData, {
    name: '', email: '', role: 'primary_carer', location: '',
    participantName: '', ndisNumber: '', supportNeeds: [],
    notificationChannel: 'email', morningBriefHour: 7, consent: false,
  });
}
