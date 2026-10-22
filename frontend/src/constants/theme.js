/**
 * Design system — single source of truth for colors and tokens.
 * Use Tailwind classes: bg-brand-600, text-accent-600, border-surface-elevated, etc.
 * For inline styles or charts: import `colors`.
 */

export const colors = {
  brand: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
  },
  accent: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
  },
  surface: {
    page: "#f1f5f9",
    card: "#ffffff",
    elevated: "#e2e8f0",
    muted: "#f8fafc",
  },
  text: {
    primary: "#0f172a",
    secondary: "#475569",
    muted: "#94a3b8",
  },
}

/** Pass to `tailwind.config.js` → theme.extend.colors */
export const tailwindThemeColors = {
  brand: colors.brand,
  accent: colors.accent,
  surface: {
    page: colors.surface.page,
    card: colors.surface.card,
    elevated: colors.surface.elevated,
    muted: colors.surface.muted,
  },
}

/** Semantic class snippets for rare non-Tailwind use */
export const themeClasses = {
  pageBg: "min-h-screen bg-surface-page",
  card:
    "rounded-2xl border border-slate-200/80 bg-surface-card shadow-sm shadow-slate-200/50",
  cardHover:
    "transition-all duration-200 hover:border-brand-200 hover:shadow-md hover:shadow-brand-500/10",
  heading: "font-semibold tracking-tight text-slate-900",
  body: "text-slate-600",
  navLink:
    "text-sm font-medium text-slate-600 transition-colors hover:text-brand-700",
  navLinkActive: "text-brand-700",
  primaryButton: "bg-brand-700 text-white hover:bg-brand-800",
  outlineButton: "border-slate-200 bg-white hover:bg-slate-50 hover:border-brand-200",
}
