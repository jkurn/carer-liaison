/* ═══════════════════════════════════════════════════════════════
   Hash-based SPA Router (with auth guard)

   Route flow:
   ┌──────────┐   hashchange   ┌──────────┐   auth     ┌──────────┐
   │  URL     │ ──────────────▶│  Router  │ ──check──▶│ Guard    │
   │ #/path   │                │  match   │           │ pass?    │
   └──────────┘                └──────────┘           └────┬─────┘
                                                           │
                                              yes ─────────┼──────── no
                                                           │         │
                                                      import()   redirect
                                                           │      #/login
                                                           ▼
                                                     ┌──────────┐
                                                     │  View    │
                                                     │ .render()│
                                                     └────┬─────┘
                                                          │
                                                     await render
                                                          │
                                                          ▼
                                                     ┌──────────┐
                                                     │  #app    │
                                                     │  (DOM)   │
                                                     └──────────┘
   ═══════════════════════════════════════════════════════════════ */

import { getUser, getProfile } from './lib/supabase.js';

const routes = {
  '/':           () => import('./views/dashboard.js'),
  '/onboarding': () => import('./views/onboarding.js'),
  '/body-state': () => import('./views/body-state.js'),
  '/services':   () => import('./views/service-search.js'),
  '/login':      () => import('./views/login.js'),
  '/settings':   () => import('./views/settings.js'),
};

// Page titles mapped to routes
const titles = {
  '/':           'Dashboard',
  '/onboarding': 'Onboarding',
  '/body-state': 'Body State History',
  '/services':   'Find Services',
  '/login':      'Sign In',
  '/settings':   'Settings',
};

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login'];

let currentView = null;

/**
 * Parse the current hash into a route path.
 * #/body-state → /body-state
 * # or empty → /
 */
function getPath() {
  const hash = location.hash.slice(1); // remove #
  return hash || '/';
}

/**
 * Navigate to a route, loading its view module and rendering it.
 */
async function navigate() {
  const path = getPath();
  const loader = routes[path];

  if (!loader) {
    // 404 — fall back to dashboard
    location.hash = '#/';
    return;
  }

  const app = document.getElementById('app');
  const pageTitle = document.getElementById('pageTitle');

  // ── Auth guard ──
  if (!PUBLIC_ROUTES.includes(path)) {
    const user = await getUser();
    if (!user) {
      location.hash = '#/login';
      return;
    }

    // Check if profile exists — redirect to onboarding if not
    if (path !== '/onboarding') {
      const profile = await getProfile();
      if (!profile) {
        location.hash = '#/onboarding';
        return;
      }
      // Update sidebar user name
      const userName = document.getElementById('userName');
      if (userName) userName.textContent = profile.name;
    }
  }

  // If logged in and hitting /login, redirect to dashboard
  if (path === '/login') {
    const user = await getUser();
    if (user) {
      location.hash = '#/';
      return;
    }
  }

  // Update page title
  if (pageTitle) {
    pageTitle.textContent = titles[path] || 'Carer Liaison';
  }
  document.title = `${titles[path] || 'Dashboard'} — Carer Liaison`;

  // Update active sidebar link
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const route = link.dataset.route;
    link.classList.toggle('active', route === path);
  });

  // Show/hide sidebar based on auth state (hide on login/onboarding)
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.style.display = (path === '/login' || path === '/onboarding') ? 'none' : '';
  }
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.style.marginLeft = (path === '/login' || path === '/onboarding') ? '0' : '';
  }

  // Teardown previous view if it has a cleanup method
  if (currentView && typeof currentView.teardown === 'function') {
    currentView.teardown();
  }

  // Load and render the new view
  try {
    const mod = await loader();
    currentView = mod;

    // Re-trigger enter animation
    app.classList.remove('view-enter');
    void app.offsetWidth; // force reflow
    app.classList.add('view-enter');

    if (typeof mod.render === 'function') {
      await mod.render(app);
    }
  } catch (err) {
    console.error(`[router] Failed to load view for ${path}:`, err);
    app.innerHTML = `
      <div class="card" style="text-align: center; padding: var(--sp-12);">
        <h2>Something went wrong</h2>
        <p class="text-muted" style="margin-top: var(--sp-2);">
          Could not load this page. <a href="#/">Return to dashboard</a>
        </p>
      </div>
    `;
  }
}

// Listen for hash changes
window.addEventListener('hashchange', navigate);

// Initial route on page load
navigate();

export { navigate, getPath };
