/**
 * HealthCoachAI Spacing Design Tokens
 * 4px modular grid system for consistent spacing
 */

// Base unit: 4px (0.25rem)
const baseUnit = 4;

export const spacing = {
  0: '0px',
  px: '1px',
  0.5: `${baseUnit * 0.5}px`, // 2px
  1: `${baseUnit * 1}px`, // 4px
  1.5: `${baseUnit * 1.5}px`, // 6px
  2: `${baseUnit * 2}px`, // 8px
  2.5: `${baseUnit * 2.5}px`, // 10px
  3: `${baseUnit * 3}px`, // 12px
  3.5: `${baseUnit * 3.5}px`, // 14px
  4: `${baseUnit * 4}px`, // 16px
  5: `${baseUnit * 5}px`, // 20px
  6: `${baseUnit * 6}px`, // 24px
  7: `${baseUnit * 7}px`, // 28px
  8: `${baseUnit * 8}px`, // 32px
  9: `${baseUnit * 9}px`, // 36px
  10: `${baseUnit * 10}px`, // 40px
  11: `${baseUnit * 11}px`, // 44px
  12: `${baseUnit * 12}px`, // 48px
  14: `${baseUnit * 14}px`, // 56px
  16: `${baseUnit * 16}px`, // 64px
  20: `${baseUnit * 20}px`, // 80px
  24: `${baseUnit * 24}px`, // 96px
  28: `${baseUnit * 28}px`, // 112px
  32: `${baseUnit * 32}px`, // 128px
  36: `${baseUnit * 36}px`, // 144px
  40: `${baseUnit * 40}px`, // 160px
  44: `${baseUnit * 44}px`, // 176px
  48: `${baseUnit * 48}px`, // 192px
  52: `${baseUnit * 52}px`, // 208px
  56: `${baseUnit * 56}px`, // 224px
  60: `${baseUnit * 60}px`, // 240px
  64: `${baseUnit * 64}px`, // 256px
  72: `${baseUnit * 72}px`, // 288px
  80: `${baseUnit * 80}px`, // 320px
  96: `${baseUnit * 96}px`, // 384px
} as const;

// Semantic spacing for common use cases
export const semanticSpacing = {
  // Component internal spacing
  component: {
    xxs: spacing[1], // 4px
    xs: spacing[2], // 8px
    sm: spacing[3], // 12px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
    xl: spacing[8], // 32px
    xxl: spacing[12], // 48px
  },

  // Layout spacing
  layout: {
    xs: spacing[4], // 16px
    sm: spacing[6], // 24px
    md: spacing[8], // 32px
    lg: spacing[12], // 48px
    xl: spacing[16], // 64px
    xxl: spacing[24], // 96px
  },

  // Page margins and padding
  page: {
    mobile: spacing[4], // 16px
    tablet: spacing[6], // 24px
    desktop: spacing[8], // 32px
  },

  // Card and surface spacing
  surface: {
    xs: spacing[3], // 12px
    sm: spacing[4], // 16px
    md: spacing[6], // 24px
    lg: spacing[8], // 32px
  },

  // Button spacing
  button: {
    xs: `${spacing[2]} ${spacing[3]}`, // 8px 12px
    sm: `${spacing[2]} ${spacing[4]}`, // 8px 16px
    md: `${spacing[3]} ${spacing[6]}`, // 12px 24px
    lg: `${spacing[4]} ${spacing[8]}`, // 16px 32px
    xl: `${spacing[5]} ${spacing[10]}`, // 20px 40px
  },

  // Form element spacing
  form: {
    input: {
      xs: `${spacing[2]} ${spacing[3]}`, // 8px 12px
      sm: `${spacing[3]} ${spacing[4]}`, // 12px 16px
      md: `${spacing[4]} ${spacing[4]}`, // 16px 16px
      lg: `${spacing[5]} ${spacing[6]}`, // 20px 24px
    },
    gap: {
      xs: spacing[2], // 8px
      sm: spacing[3], // 12px
      md: spacing[4], // 16px
      lg: spacing[6], // 24px
    },
  },

  // List and content spacing
  content: {
    paragraph: spacing[4], // 16px between paragraphs
    section: spacing[8], // 32px between sections
    heading: spacing[6], // 24px around headings
  },

  // Touch targets (mobile)
  touch: {
    min: spacing[11], // 44px minimum touch target
    comfortable: spacing[12], // 48px comfortable touch target
    large: spacing[14], // 56px large touch target
  },
} as const;

// Container and layout constraints
export const containers = {
  // Maximum width constraints
  maxWidth: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px',
  },

  // Content width constraints
  content: {
    narrow: '640px', // For text-heavy content
    medium: '768px', // For forms and medium content
    wide: '1024px', // For wide layouts
    full: '100%', // Full width
  },
} as const;

// Grid system
export const grid = {
  // Column counts
  columns: {
    mobile: 4,
    tablet: 8,
    desktop: 12,
  },

  // Gutter spacing
  gutters: {
    mobile: spacing[4], // 16px
    tablet: spacing[6], // 24px
    desktop: spacing[8], // 32px
  },

  // Margin spacing
  margins: {
    mobile: spacing[4], // 16px
    tablet: spacing[8], // 32px
    desktop: spacing[12], // 48px
  },
} as const;

// Border radius values
export const borderRadius = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Animation timing and easing
export const animation = {
  // Duration values
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    easeInBack: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
    easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easeInOutBack: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  },
} as const;

export const spacingTokens = {
  spacing,
  semantic: semanticSpacing,
  containers,
  grid,
  borderRadius,
  zIndex,
  animation,
} as const;

export type Spacing = typeof spacing;
export type SemanticSpacing = typeof semanticSpacing;
export type Containers = typeof containers;
export type Grid = typeof grid;
export type BorderRadius = typeof borderRadius;
export type ZIndex = typeof zIndex;
export type Animation = typeof animation;
