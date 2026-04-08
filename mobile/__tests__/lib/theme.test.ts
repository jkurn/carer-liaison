/**
 * Tests for theme.ts — design token integrity.
 *
 * Ensures tokens match DESIGN.md and won't silently break styling.
 */
import { colors, fonts, type, spacing, radius } from '../../lib/theme';
import { expectHexColor } from '../helpers';

describe('color tokens', () => {
  it('accent matches DESIGN.md (#0891B2)', () => {
    expect(colors.accent).toBe('#0891B2');
  });

  it('all surface colors are valid hex codes', () => {
    expectHexColor(colors.bgPage);
    expectHexColor(colors.bgCard);
    expectHexColor(colors.bgElevated);
  });

  it('all 5 body state colors are valid hex codes', () => {
    expectHexColor(colors.bodyGreat);
    expectHexColor(colors.bodyCalm);
    expectHexColor(colors.bodyNeutral);
    expectHexColor(colors.bodyResistant);
    expectHexColor(colors.bodyDifficult);
  });

  it('all RBT semantic colors are valid hex codes', () => {
    expectHexColor(colors.rose);
    expectHexColor(colors.roseLight);
    expectHexColor(colors.bud);
    expectHexColor(colors.budLight);
    expectHexColor(colors.thorn);
    expectHexColor(colors.thornLight);
  });

  it('crisis red is actual red', () => {
    expect(colors.crisisRed).toBe('#DC2626');
  });
});

describe('font families', () => {
  it('has serif, sans, and mono', () => {
    expect(fonts.serif).toBe('DMSerifDisplay');
    expect(fonts.sans).toBe('DMSans');
    expect(fonts.mono).toBe('JetBrainsMono');
  });

  it('does NOT include Inter (removed in font consolidation)', () => {
    const fontValues = Object.values(fonts);
    expect(fontValues).not.toContain('Inter');
  });
});

describe('type scale', () => {
  it('page title uses serif font', () => {
    expect(type.pageTitle.fontFamily).toBe(fonts.serif);
  });

  it('body uses sans font at 14px', () => {
    expect(type.body.fontFamily).toBe(fonts.sans);
    expect(type.body.fontSize).toBe(14);
  });

  it('all type styles have required properties', () => {
    const styles = [type.pageTitle, type.sectionHeading, type.cardTitle, type.body, type.caption];
    for (const style of styles) {
      expect(style.fontFamily).toBeDefined();
      expect(style.fontSize).toBeGreaterThan(0);
      expect(style.lineHeight).toBeGreaterThan(0);
    }
  });
});

describe('spacing scale', () => {
  it('uses 4px base unit', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(12);
    expect(spacing.base).toBe(16);
  });

  it('all values are multiples of 4', () => {
    for (const value of Object.values(spacing)) {
      expect(value % 4).toBe(0);
    }
  });
});

describe('radius', () => {
  it('cards use 12px radius', () => {
    expect(radius.md).toBe(12);
  });

  it('buttons use 8px radius', () => {
    expect(radius.sm).toBe(8);
  });
});
