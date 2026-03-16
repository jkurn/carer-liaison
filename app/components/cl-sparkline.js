/* ═══════════════════════════════════════════════════════════════
   <cl-sparkline> — Mini inline chart with GSAP line-draw animation

   Usage:
     <cl-sparkline values="65,70,68,75,78,72,80" color="#008080"></cl-sparkline>

   Attributes:
     values — comma-separated numbers
     width  — SVG width (default: 120)
     height — SVG height (default: 36)
     color  — line color (default: teal)
   ═══════════════════════════════════════════════════════════════ */

class ClSparkline extends HTMLElement {
  static get observedAttributes() {
    return ['values', 'width', 'height', 'color'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) this._render();
  }

  get _values() {
    const raw = this.getAttribute('values') || '';
    return raw.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
  }
  get _width()  { return parseInt(this.getAttribute('width')) || 120; }
  get _height() { return parseInt(this.getAttribute('height')) || 36; }
  get _color()  { return this.getAttribute('color') || 'var(--teal, #008080)'; }

  _render() {
    const values = this._values;
    if (values.length < 2) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    const w = this._width;
    const h = this._height;
    const pad = 2;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    // Build polyline points
    const points = values.map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    }).join(' ');

    // Build gradient fill path
    const firstX = pad;
    const lastX = pad + (w - pad * 2);
    const fillPoints = `${firstX},${h} ${points} ${lastX},${h}`;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          line-height: 0;
        }
        svg { overflow: visible; }
        .spark-fill {
          fill: ${this._color};
          opacity: 0.08;
        }
        .spark-line {
          fill: none;
          stroke: ${this._color};
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .spark-dot {
          fill: ${this._color};
        }
      </style>
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <polygon class="spark-fill" points="${fillPoints}" />
        <polyline class="spark-line" points="${points}" />
        <circle class="spark-dot" cx="${pad + (w - pad * 2)}" cy="${pad + (1 - (values[values.length - 1] - min) / range) * (h - pad * 2)}" r="2.5" />
      </svg>
    `;

    // Animate line draw with GSAP if available
    const line = this.shadowRoot.querySelector('.spark-line');
    if (line && typeof gsap !== 'undefined') {
      const length = line.getTotalLength();
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
      gsap.to(line, {
        strokeDashoffset: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.2
      });
    }
  }
}

customElements.define('cl-sparkline', ClSparkline);
export default ClSparkline;
