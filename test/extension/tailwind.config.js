// tailwind.config.js — PhishGuard.AI
// Run: npx tailwindcss -i ./src/index.css -o ./popup.css --watch
 
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./popup.html",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // ── Neon color palette ───────────────────────────────────────────────
      colors: {
        neon: {
          cyan:   "#22d3ee",
          indigo: "#818cf8",
          red:    "#ff2d55",
          yellow: "#ffd60a",
          green:  "#30d158",
        },
        surface: {
          900: "#060d1a",
          800: "#0a0f1a",
          700: "#0f172a",
          600: "#111827",
          500: "#1e293b",
          400: "#334155",
        },
      },
 
      // ── Font family ──────────────────────────────────────────────────────
      fontFamily: {
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
 
      // ── Box shadows — glow effects ────────────────────────────────────────
      boxShadow: {
        "neon-cyan":   "0 0 20px rgba(34, 211, 238, 0.4)",
        "neon-red":    "0 0 20px rgba(255, 45, 85, 0.4)",
        "neon-yellow": "0 0 20px rgba(255, 214, 10, 0.4)",
        "neon-green":  "0 0 20px rgba(48, 209, 88, 0.4)",
        "gauge":       "0 0 40px rgba(34, 211, 238, 0.15)",
      },
 
      // ── Animations ────────────────────────────────────────────────────────
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "gauge-fill": {
          "0%":   { strokeDashoffset: "226" },
          "100%": { strokeDashoffset: "var(--gauge-offset)" },
        },
        "neon-pulse": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 10px currentColor" },
          "50%":       { opacity: "0.7", boxShadow: "0 0 25px currentColor" },
        },
        "dna-spin": {
          "from": { transform: "rotate(0deg)" },
          "to":   { transform: "rotate(360deg)" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "progress-bar": {
          "0%":   { width: "0%" },
          "100%": { width: "100%" },
        },
        "grid-scroll": {
          "0%":   { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "24px 24px" },
        },
      },
      animation: {
        shimmer:      "shimmer 3s linear infinite",
        "gauge-fill": "gauge-fill 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "dna-spin":   "dna-spin 1s linear infinite",
        "fade-up":    "fade-up 0.25s ease-out",
        "progress":   "progress-bar 1.5s ease-out forwards",
        "grid-scroll": "grid-scroll 4s linear infinite",
      },
 
      // ── Border radius ─────────────────────────────────────────────────────
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
 
      // ── Backdrop blur ─────────────────────────────────────────────────────
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    // Custom plugin: SVG gauge CSS variables helper
    function({ addUtilities, theme }) {
      const riskColors = {
        ".gauge-critical": { "--gauge-color": theme("colors.neon.red"),    "--gauge-glow": "rgba(255,45,85,0.4)" },
        ".gauge-moderate":  { "--gauge-color": theme("colors.neon.yellow"), "--gauge-glow": "rgba(255,214,10,0.4)" },
        ".gauge-safe":      { "--gauge-color": theme("colors.neon.green"),  "--gauge-glow": "rgba(48,209,88,0.4)" },
      };
      addUtilities(riskColors);
 
      // Neon text glow helpers
      addUtilities({
        ".text-glow-cyan":   { textShadow: `0 0 16px ${theme("colors.neon.cyan")}` },
        ".text-glow-red":    { textShadow: `0 0 16px ${theme("colors.neon.red")}` },
        ".text-glow-yellow": { textShadow: `0 0 16px ${theme("colors.neon.yellow")}` },
        ".text-glow-green":  { textShadow: `0 0 16px ${theme("colors.neon.green")}` },
      });
    },
  ],
};
 
/*
───────────────────────────────────────────────────────────────────────────────
  TAILWIND + SVG GAUGE INTEGRATION NOTES
───────────────────────────────────────────────────────────────────────────────
 
  The semi-circular SVG gauge in RiskGauge component uses:
    • R = 72 (radius)
    • strokeDasharray = R * π ≈ 226 (half circumference for semi-circle)
    • strokeDashoffset = 226 - (score/100 * 226)
 
  To animate via CSS instead of JS, set:
    <path
      style={{ "--gauge-offset": `${226 - (score/100 * 226)}` }}
      className="animate-gauge-fill"
      stroke="var(--gauge-color)"
    />
 
  CSS variable approach for theme-driven stroke colors:
    .gauge-critical { --gauge-color: #ff2d55; }  → 70+ scores
    .gauge-moderate { --gauge-color: #ffd60a; }  → 40–69 scores
    .gauge-safe     { --gauge-color: #30d158; }  → <40 scores
 
  These are already registered as custom utilities via the plugin above.
 
───────────────────────────────────────────────────────────────────────────────
  BUILD COMMANDS
───────────────────────────────────────────────────────────────────────────────
 
  Development:
    npx tailwindcss -i ./src/index.css -o ./popup.css --watch
 
  Production (minified):
    npx tailwindcss -i ./src/index.css -o ./popup.css --minify
 
  Entry src/index.css:
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
*/
 