/* ═══════════════════════════════════════════════════════════════
   Login / Auth — Supabase email/password + magic link

   Auth flow:
   ┌──────────┐   submit    ┌──────────────┐   success   ┌──────────┐
   │  Form    │ ──────────▶ │  Supabase    │ ──────────▶ │  #/      │
   │  (email  │             │  Auth API    │             │ dashboard│
   │   + pw)  │             └──────┬───────┘             └──────────┘
   └──────────┘                    │
                              error │
                                    ▼
                              ┌──────────┐
                              │ Show msg │
                              └──────────┘
   ═══════════════════════════════════════════════════════════════ */

import { supabase } from '../lib/supabase.js';

export async function render(el) {
  el.innerHTML = `
    <div style="max-width: 400px; margin: var(--sp-16) auto;">
      <div class="card stack stack-6" style="text-align: center;">
        <div>
          <div style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--teal); margin-bottom: var(--sp-2);">Carer Liaison</div>
          <h2 style="margin-bottom: var(--sp-2);">Welcome back</h2>
          <p class="text-sm text-muted">Sign in to your Carer Liaison dashboard</p>
        </div>

        <div id="authError" class="text-sm" style="color: var(--red); display: none; padding: var(--sp-3); background: var(--red-bg); border-radius: var(--r-sm);"></div>
        <div id="authSuccess" class="text-sm" style="color: var(--green); display: none; padding: var(--sp-3); background: var(--green-bg); border-radius: var(--r-sm);"></div>

        <form id="loginForm" class="stack stack-4" style="text-align: left;">
          <div class="stack stack-2">
            <label class="label" for="loginEmail">Email address</label>
            <input type="email" class="input" id="loginEmail" placeholder="you@example.com" required>
          </div>
          <div class="stack stack-2">
            <label class="label" for="loginPassword">Password</label>
            <input type="password" class="input" id="loginPassword" placeholder="Your password" required minlength="6">
          </div>
          <button type="submit" class="btn btn-primary btn-lg" id="loginBtn" style="width: 100%;">
            Sign In
          </button>
        </form>

        <hr class="divider">

        <button class="btn btn-secondary" style="width: 100%;" id="magicLinkBtn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Send Magic Link instead
        </button>

        <hr class="divider">

        <p class="text-sm text-muted">
          Don't have an account?
          <a href="#" id="signUpLink" style="color: var(--teal); font-weight: 500;">Create one</a>
        </p>

        <!-- Sign Up Form (hidden by default) -->
        <form id="signUpForm" class="stack stack-4" style="text-align: left; display: none;">
          <div class="stack stack-2">
            <label class="label" for="signUpEmail">Email address</label>
            <input type="email" class="input" id="signUpEmail" placeholder="you@example.com" required>
          </div>
          <div class="stack stack-2">
            <label class="label" for="signUpPassword">Create password</label>
            <input type="password" class="input" id="signUpPassword" placeholder="At least 6 characters" required minlength="6">
          </div>
          <button type="submit" class="btn btn-primary btn-lg" id="signUpBtn" style="width: 100%;">
            Create Account
          </button>
          <p class="text-sm text-muted" style="text-align: center;">
            Already have an account?
            <a href="#" id="backToLogin" style="color: var(--teal); font-weight: 500;">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  `;

  const errorEl = document.getElementById('authError');
  const successEl = document.getElementById('authSuccess');
  const loginForm = document.getElementById('loginForm');
  const signUpForm = document.getElementById('signUpForm');

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    successEl.style.display = 'none';
  }

  function showSuccess(msg) {
    successEl.textContent = msg;
    successEl.style.display = 'block';
    errorEl.style.display = 'none';
  }

  function clearMessages() {
    errorEl.style.display = 'none';
    successEl.style.display = 'none';
  }

  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.style.opacity = loading ? '0.6' : '1';
  }

  // Toggle sign-up / login forms
  document.getElementById('signUpLink').addEventListener('click', (e) => {
    e.preventDefault();
    clearMessages();
    loginForm.style.display = 'none';
    document.querySelector('.divider').style.display = 'none';
    document.getElementById('magicLinkBtn').style.display = 'none';
    signUpForm.style.display = '';
  });

  document.getElementById('backToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    clearMessages();
    loginForm.style.display = '';
    document.querySelector('.divider').style.display = '';
    document.getElementById('magicLinkBtn').style.display = '';
    signUpForm.style.display = 'none';
  });

  // Sign in with email/password
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');

    setLoading(btn, true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(btn, false);

    if (error) {
      showError(error.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please try again.'
        : error.message);
      return;
    }

    location.hash = '#/';
  });

  // Sign up with email/password
  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value;
    const btn = document.getElementById('signUpBtn');

    setLoading(btn, true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(btn, false);

    if (error) {
      showError(error.message);
      return;
    }

    showSuccess('Account created! Check your email to confirm, then sign in.');
  });

  // Magic link
  document.getElementById('magicLinkBtn').addEventListener('click', async () => {
    clearMessages();
    const email = document.getElementById('loginEmail').value.trim();
    if (!email || !email.includes('@')) {
      showError('Please enter your email address first.');
      return;
    }

    const btn = document.getElementById('magicLinkBtn');
    setLoading(btn, true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(btn, false);

    if (error) {
      showError(error.message);
      return;
    }

    showSuccess('Magic link sent! Check your email and click the link to sign in.');
  });
}

export function teardown() {}
