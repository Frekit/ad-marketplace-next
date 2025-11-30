/**
 * Unified Color System
 * Central source of truth for all colors in the application
 * Used for both Tailwind CSS and non-CSS contexts (emails, etc)
 */

export const colors = {
  // Brand Colors
  primary: '#FF5C5C',      // Coral - CTAs, logo, primary actions
  secondary: '#0F4C5C',    // Teal - Secondary actions, info, data
  accent: '#5b65ff',       // Electric Blue - Highlights, focus states

  // Semantic Colors
  success: '#17c964',      // Green - Success states, confirmations
  warning: '#f5a524',      // Orange - Warnings, alerts
  danger: '#f31260',       // Red/Pink - Errors, destructive actions
  info: '#0F4C5C',         // Teal - Info messages (same as secondary)

  // Neutral Colors (Dark Mode)
  background: '#0a0b0f',   // Deep dark - Main background
  surface: '#141820',      // Dark surface - Cards, elevated elements
  surfaceHover: '#1a1f2e', // Slightly lighter for hover states
  muted: '#2a2f3f',        // Muted - Secondary text, disabled states
  border: '#3a3f4f',       // Subtle dividers and borders

  // Text Colors
  text: '#ffffff',         // Primary text
  textSecondary: '#d9d9da', // Secondary text
  textMuted: '#8c8c90',    // Muted text

  // Legacy colors (still in use, being phased out)
  legacy: {
    coral: '#FF5C5C',
    teal: '#0F4C5C',
  },
};

/**
 * Color for non-CSS contexts (emails, etc)
 * Can be used directly in HTML/template strings
 */
export const colorHex = {
  primary: colors.primary,
  secondary: colors.secondary,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  text: colors.text,
  textMuted: colors.textMuted,
  background: colors.background,
};

/**
 * Tailwind CSS class mappings
 * Use these when you need the actual Tailwind class names
 */
export const colorClasses = {
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-white',
  success: 'bg-success text-black',
  warning: 'bg-warning text-black',
  danger: 'bg-danger text-white',
  muted: 'bg-muted text-textMuted',
  surface: 'bg-surface text-text',
} as const;
