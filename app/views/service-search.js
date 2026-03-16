/* ═══════════════════════════════════════════════════════════════
   Service Search — Find NDIS providers and local services

   Discovery framing: results shown as "we found these from [sources]"
   not recommendations. Source, verification date, and "call to verify"
   prompt included on every result.

   Layout:
   ┌──────────────────────────────────────────────────────────┐
   │  Find Services                                          │
   ├──────────────────────────────────────────────────────────┤
   │  ┌─── Search ───────────────────────────────────────────┐│
   │  │ [What do you need?    ] [Location      ] [Search →] ││
   │  └──────────────────────────────────────────────────────┘│
   │                                                          │
   │  We found 3 results from NDIS Provider Finder, Carer    │
   │  Gateway, and Clickability                               │
   │                                                          │
   │  ┌─── Result Card ─────────────────────────────────────┐ │
   │  │ Provider Name              ★ 4.2  (12 reviews)      │ │
   │  │ Physiotherapy · Parramatta · 2.3km                  │ │
   │  │ Source: NDIS Provider Finder · Verified: Feb 2026   │ │
   │  │ ⚠ Always call to verify availability                │ │
   │  │ [📞 Call] [🌐 Website] [📍 Directions]              │ │
   │  └─────────────────────────────────────────────────────┘ │
   └──────────────────────────────────────────────────────────┘
   ═══════════════════════════════════════════════════════════════ */

const DEMO_RESULTS = [
  {
    name: 'PhysioPlus Parramatta',
    type: 'Physiotherapy',
    location: 'Parramatta, NSW',
    distance: '2.3km',
    rating: 4.2,
    reviews: 12,
    source: 'NDIS Provider Finder',
    verified: 'Feb 2026',
    phone: '02 9123 4567',
    website: '#',
    ndisRegistered: true,
    waitlist: '~2 weeks',
  },
  {
    name: 'Active Life Therapy',
    type: 'Physiotherapy',
    location: 'Westmead, NSW',
    distance: '4.1km',
    rating: 4.5,
    reviews: 28,
    source: 'Clickability',
    verified: 'Jan 2026',
    phone: '02 9876 5432',
    website: '#',
    ndisRegistered: true,
    waitlist: 'Accepting new clients',
  },
  {
    name: 'Cumberland Community Physio',
    type: 'Physiotherapy',
    location: 'Merrylands, NSW',
    distance: '5.8km',
    rating: 3.9,
    reviews: 7,
    source: 'Carer Gateway',
    verified: 'Dec 2025',
    phone: '02 9654 3210',
    website: '#',
    ndisRegistered: false,
    waitlist: 'Unknown — call to check',
  },
];

function starRating(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

export function render(el) {
  el.innerHTML = `
    <!-- HEADER -->
    <div style="margin-bottom: var(--sp-6);">
      <h2>Find Services</h2>
      <p class="text-sm text-muted">Search NDIS providers, local services, and community resources</p>
    </div>

    <!-- SEARCH BAR -->
    <div class="card" style="margin-bottom: var(--sp-6);">
      <form id="searchForm" class="row gap-3" style="flex-wrap: wrap;">
        <div style="flex: 2; min-width: 200px;">
          <input type="text" class="input" id="searchQuery" placeholder="What do you need? e.g., physiotherapy, speech therapy..." value="physiotherapy">
        </div>
        <div style="flex: 1; min-width: 150px;">
          <input type="text" class="input" id="searchLocation" placeholder="Location or postcode" value="Parramatta, NSW">
        </div>
        <button type="submit" class="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          Search
        </button>
      </form>
    </div>

    <!-- SOURCES INFO -->
    <div class="row gap-2" style="margin-bottom: var(--sp-4); flex-wrap: wrap;">
      <p class="text-sm">
        We found <strong>${DEMO_RESULTS.length} results</strong> from
      </p>
      <span class="badge badge-teal">NDIS Provider Finder</span>
      <span class="badge badge-teal">Clickability</span>
      <span class="badge badge-teal">Carer Gateway</span>
    </div>

    <!-- RESULTS -->
    <div class="stack stack-4" id="results">
      ${DEMO_RESULTS.map(r => `
        <div class="card stack stack-3">
          <!-- Header -->
          <div class="row-between" style="flex-wrap: wrap; gap: var(--sp-2);">
            <div>
              <h3 style="font-size: 1.1rem; margin-bottom: 2px;">${r.name}</h3>
              <p class="text-sm text-muted">${r.type} · ${r.location} · ${r.distance}</p>
            </div>
            <div style="text-align: right;">
              <p style="color: var(--amber); font-size: 0.9rem; letter-spacing: 1px;">${starRating(r.rating)} <span style="color: var(--dark); font-weight: 600;">${r.rating}</span></p>
              <p class="text-xs text-muted">${r.reviews} reviews</p>
            </div>
          </div>

          <!-- Tags -->
          <div class="row gap-2" style="flex-wrap: wrap;">
            ${r.ndisRegistered
              ? '<span class="badge badge-green"><span class="badge-dot"></span> NDIS Registered</span>'
              : '<span class="badge badge-amber">Not NDIS Registered</span>'
            }
            <span class="badge badge-muted">${r.waitlist}</span>
          </div>

          <!-- Source + verification -->
          <div class="card-surface" style="padding: var(--sp-3) var(--sp-4);">
            <p class="text-xs text-muted">
              Source: <strong>${r.source}</strong> · Verified: ${r.verified}
            </p>
            <p class="text-xs" style="color: var(--amber-dark); margin-top: 2px;">
              ⚠ Always call to verify current availability and pricing
            </p>
          </div>

          <!-- Actions -->
          <div class="row gap-3" style="flex-wrap: wrap;">
            <a href="tel:${r.phone.replace(/\s/g, '')}" class="btn btn-primary btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              Call ${r.phone}
            </a>
            <a href="${r.website}" class="btn btn-secondary btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              Website
            </a>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- DISCLAIMER -->
    <div style="margin-top: var(--sp-6); padding: var(--sp-4); border-left: 3px solid var(--border); border-radius: 0 var(--r-sm) var(--r-sm) 0;">
      <p class="text-xs text-muted">
        <strong>Disclaimer:</strong> Carer Liaison aggregates publicly available directory listings.
        We do not endorse or recommend any provider. Always verify NDIS registration, availability,
        and suitability directly with the provider. Information may be outdated — verification dates shown.
      </p>
    </div>
  `;

  // Animate result cards
  if (typeof gsap !== 'undefined') {
    gsap.from(el.querySelectorAll('.card'), {
      y: 20,
      opacity: 0,
      duration: 0.4,
      stagger: 0.08,
      ease: 'power2.out',
    });
  }
}

export function teardown() {}
