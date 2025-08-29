/**
 * HealthCoachAI Design Tokens
 * Main export file for all design tokens
 */

export * from './colors';
export * from './typography';
export * from './spacing';

// Re-export commonly used token groups
export { colors } from './colors';
export { typography } from './typography';
export { spacingTokens as spacing } from './spacing';

// Design system metadata
export const designSystem = {
  name: 'HealthCoachAI Design System',
  version: '1.0.0',
  description: 'Design tokens for HealthCoachAI applications',
  baseUnit: 4, // 4px base unit for spacing
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },
  accessibility: {
    minTouchTarget: '44px', // WCAG AA minimum
    contrastRatio: {
      normal: 4.5, // WCAG AA
      large: 3, // WCAG AA for large text
      enhanced: 7, // WCAG AAA
    },
  },
} as const;

export type DesignSystem = typeof designSystem;
