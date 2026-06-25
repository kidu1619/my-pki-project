module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: "#F8FAFC",
          dark: "#0F172A",
        },
        surface: {
          default: "#FFFFFF",
          border: "#E2E8F0",
        },
        brand: {
          primary: "#2563EB",
          hover: "#1D4ED8",
        },
        text: {
          primary: "#0F172A",
          secondary: "#334155",
          muted: "#64748B",
        },
        pki: {
          success: {
            bg: "#D1FAE5",
            text: "#065F46",
          },
          warning: {
            bg: "#FEF3C7",
            text: "#92400E",
          },
          danger: {
            bg: "#FEE2E2",
            text: "#991B1B",
          },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "Roboto",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "SF Mono",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      fontSize: {
        title: ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],
        section: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        subtitle: ["1rem", { lineHeight: "1.5rem", fontWeight: "500" }],
        body: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        table: ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};
