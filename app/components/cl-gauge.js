/* ═══════════════════════════════════════════════════════════════
   <cl-gauge> — Circular progress gauge with GSAP animation

   Usage:
     <cl-gauge value="78" max="100" label="Sleep" size="120"></cl-gauge>

   Attributes:
     value  — current value (animated from 0 on connect)
     max    — maximum value (default: 100)
     label  — text label below the number
     size   — diameter in px (default: 120)
     color  — stroke color (default: teal)

   Visual structure:
     ┌─────────────┐
     │   ╭───╮     │
     │  │  78  │    │  ← animated counter + arc
     │   ╰───╯     │
     │   Sleep      │  ← label
     └─────────────┘
   ═══════════════════════════════════════════════════════════════ */

class ClGauge extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'max', 'label', 'size', 'color'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    this._animate();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.shadowRoot.querySelector('svg')) {
      this._render();
      this._animate();
    }
  }

  get _value() { return parseFloat(this.getAttribute('value')) || 0; }
  get _max()   { return parseFloat(this.getAttribute('max')) || 100; }
  get _label() { return this.getAttribute('label') || ''; }
  get _size()  { return parseInt(this.getAttribute('size')) || 120; }
  get _color() { return this.getAttribute('color') || 'var(--teal, #008080)'; }

  _render() {
    const size = this._size;
    const strokeW = Math.max(6, size * 0.06);
    const radius = (size - strokeW) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .gauge-wrap {
          position: relative;
          width: ${size}px;
          height: ${size}px;
        }
        svg {
          transform: rotate(-90deg);
          width: ${size}px;
          height: ${size}px;
        }
        .track {
          fill: none;
          stroke: var(--border-light, #edece8);
          stroke-width: ${strokeW};
        }
        .fill {
          fill: none;
          stroke: ${this._color};
          stroke-width: ${strokeW};
          stroke-linecap: round;
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${circumference};
          transition: stroke 0.3s;
        }
        .value-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: var(--font-serif, 'DM Serif Display', Georgia, serif);
          font-size: ${size * 0.28}px;
          color: var(--dark, #1a1a1a);
          line-height: 1;
        }
        .label {
          font-family: var(--font-sans, 'DM Sans', sans-serif);
          font-size: ${Math.max(11, size * 0.1)}px;
          color: var(--mid-gray, #6b6b68);
          text-align: center;
        }
      </style>
      <div class="gauge-wrap">
        <svg viewBox="0 0 ${size} ${size}">
          <circle class="track" cx="${center}" cy="${center}" r="${radius}" />
          <circle class="fill" cx="${center}" cy="${center}" r="${radius}" />
        </svg>
        <span class="value-text" id="counter">0</span>
      </div>
      ${this._label ? `<span class="label">${this._label}</span>` : ''}
    `;
  }

  _animate() {
    const fill = this.shadowRoot.querySelector('.fill');
    const counter = this.shadowRoot.querySelector('#counter');
    if (!fill || !counter) return;

    const size = this._size;
    const strokeW = Math.max(6, size * 0.06);
    const radius = (size - strokeW) / 2;
    const circumference = 2 * Math.PI * radius;
    const ratio = Math.min(this._value / this._max, 1);
    const targetOffset = circumference * (1 - ratio);

    // Use GSAP if available, otherwise CSS transition fallback
    if (typeof gsap !== 'undefined') {
      const obj = { val: 0, offset: circumference };
      gsap.to(obj, {
        val: this._value,
        offset: targetOffset,
        duration: 1,
        ease: 'power2.out',
        onUpdate: () => {
          counter.textContent = Math.round(obj.val);
          fill.style.strokeDashoffset = obj.offset;
        }
      });
    } else {
      fill.style.transition = 'stroke-dashoffset 1s ease-out';
      fill.style.strokeDashoffset = targetOffset;
      counter.textContent = Math.round(this._value);
    }
  }
}

customElements.define('cl-gauge', ClGauge);
export default ClGauge;
