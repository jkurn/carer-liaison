/**
 * Design tokens — translated directly from DESIGN.md.
 * This is the single source of truth for all visual values in the app.
 *
 * Fonts: DM Serif Display (page titles) + DM Sans (everything) + JetBrains Mono (data)
 * Colors: Teal accent, warm neutrals, semantic body state + RBT palette
 * Spacing: 4px base unit
 */

export const colors = {
  // Surfaces
  bgPage: '#F9FAFB',
  bgCard: '#F1F5F9',
  bgElevated: '#FFFFFF',

  // Accent
  accent: '#0891B2',
  accentEnd: '#0E7490',
  accentLight: 'rgba(8, 145, 178, 0.08)',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textMuted: '#CBD5E1',
  textOnAccent: '#FFFFFF',
  textOnAccentMuted: 'rgba(255, 255, 255, 0.8)',
  textOnAccentSubtle: 'rgba(255, 255, 255, 0.7)',

  // Semantic — Body State
  bodyGreat: '#059669',
  bodyCalm: '#0891B2',
  bodyNeutral: '#94A3B8',
  bodyResistant: '#F59E0B',
  bodyDifficult: '#EF4444',

  // Semantic — Journal (Rose/Bud/Thorn)
  rose: '#F43F5E',
  roseLight: '#FFF1F2',
  bud: '#10B981',
  budLight: '#ECFDF5',
  thorn: '#F59E0B',
  thornLight: '#FFFBEB',

  // Semantic — Status
  success: '#059669',
  crisisRed: '#DC2626',
  crisisBg: '#FEF2F2',
  journalPurple: '#8B5CF6',
  journalPurpleLight: '#F5F3FF',

  // Borders
  borderSubtle: '#E2E8F0',
  borderStrong: '#CBD5E1',
} as const;

export const fonts = {
  serif: 'DMSerifDisplay',
  sans: 'DMSans',
  sansItalic: 'DMSans-Italic',
  mono: 'JetBrainsMono',
} as const;

export const type = {
  pageTitle: {
    fontFamily: fonts.serif,
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 34, // 28 * 1.2
  },
  sectionHeading: {
    fontFamily: fonts.sans,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 23, // 18 * 1.3
  },
  cardTitle: {
    fontFamily: fonts.sans,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22, // 16 * 1.4
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 21, // 14 * 1.5
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 17, // 12 * 1.4
  },
  overline: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14, // 11 * 1.3
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  tabLabel: {
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 13, // 10 * 1.3
    letterSpacing: 0.5,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const theme = {
  colors,
  fonts,
  type,
  spacing,
  radius,
} as const;

export default theme;
