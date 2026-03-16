/* Login / Auth view — placeholder for Supabase Auth integration */

export function render(el) {
  el.innerHTML = `
    <div style="max-width: 400px; margin: var(--sp-16) auto;">
      <div class="card stack stack-6" style="text-align: center;">
        <div>
          <h2 style="margin-bottom: var(--sp-2);">Welcome back</h2>
          <p class="text-sm text-muted">Sign in to your Carer Liaison dashboard</p>
        </div>

        <form id="loginForm" class="stack stack-4" style="text-align: left;">
          <div class="stack stack-2">
            <label class="label" for="loginEmail">Email address</label>
            <input type="email" class="input" id="loginEmail" placeholder="you@example.com" required>
          </div>
          <div class="stack stack-2">
            <label class="label" for="loginPassword">Password</label>
            <input type="password" class="input" id="loginPassword" placeholder="Your password" required>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
            Sign In
          </button>
        </form>

        <hr class="divider">

        <button class="btn btn-secondary" style="width: 100%;" id="magicLinkBtn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Send Magic Link instead
        </button>

        <p class="text-xs text-muted">
          Don't have an account? <a href="#/onboarding" style="color: var(--teal);">Get started</a>
        </p>
      </div>
    </div>
  `;

  // Placeholder — will wire to Supabase Auth
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // TODO: Supabase auth.signInWithPassword()
    location.hash = '#/';
  });

  document.getElementById('magicLinkBtn').addEventListener('click', () => {
    // TODO: Supabase auth.signInWithOtp()
    alert('Magic link flow — will be connected to Supabase Auth');
  });
}

export function teardown() {}
