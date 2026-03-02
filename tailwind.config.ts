import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f4ff",
          100: "#dbe4ff",
          200: "#bac8ff",
          300: "#91a7ff",
          400: "#748ffc",
          500: "#5c7cfa",
          600: "#4c6ef5",
          700: "#4263eb",
          800: "#3b5bdb",
          900: "#364fc7",
        },
        dream: {
          light: "#f8f6ff",
          DEFAULT: "#6c5ce7",
          dark: "#341f97",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      typography: ({ theme }: { theme: any }) => ({
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#374151",
            lineHeight: "1.75",
            p: {
              marginTop: "1.25em",
              marginBottom: "1.25em",
              fontSize: "0.95rem", // Mobile-friendly base font
              lineHeight: "1.8",
            },
            h1: {
              color: "#111827",
              fontWeight: "700",
              fontSize: "1.875rem",
            },
            h2: {
              color: "#111827",
              fontWeight: "700",
              fontSize: "1.5rem",
              marginTop: "1.5em",
              marginBottom: "0.75em",
            },
            h3: {
              color: "#1f2937",
              fontWeight: "600",
              fontSize: "1.25rem",
              marginTop: "1.25em",
            },
            a: {
              color: "#6c5ce7",
              textDecoration: "underline",
              textDecorationColor: "rgba(108, 92, 231, 0.3)",
              "&:hover": {
                color: "#5c4ec7",
                textDecorationColor: "rgba(108, 92, 231, 0.6)",
              },
            },
            strong: {
              color: "#111827",
              fontWeight: "600",
            },
            em: {
              fontStyle: "italic",
              color: "#374151",
            },
            code: {
              backgroundColor: "#f3f4f6",
              color: "#d946ef",
              padding: "0.125em 0.375em",
              borderRadius: "0.25rem",
              fontSize: "0.875em",
              fontFamily: '"Monaco", "Courier New", monospace',
            },
            pre: {
              backgroundColor: "#1f2937",
              color: "#e5e7eb",
              padding: "1rem",
              borderRadius: "0.5rem",
              overflowX: "auto",
            },
            blockquote: {
              color: "#6b7280",
              borderLeftColor: "#6c5ce7",
              borderLeftWidth: "0.25em",
              paddingLeft: "1em",
              fontStyle: "italic",
            },
            li: {
              marginTop: "0.5em",
              marginBottom: "0.5em",
              lineHeight: "1.75",
            },
            "ul > li": {
              paddingLeft: "1.5em",
            },
            "ol > li": {
              paddingLeft: "1.75em",
            },
          },
        },
        // Mobil screens için sm variant (font size 0.875rem)
        sm: {
          css: {
            fontSize: "0.875rem",
            lineHeight: "1.6",
            p: {
              marginTop: "0.8em",
              marginBottom: "0.8em",
            },
            h1: {
              fontSize: "1.5rem",
            },
            h2: {
              fontSize: "1.25rem",
              marginTop: "1em",
            },
            h3: {
              fontSize: "1.125rem",
            },
          },
        },
        // Large screens için lg variant (font size 1.125rem)
        lg: {
          css: {
            fontSize: "1.125rem",
            p: {
              marginTop: "1.5em",
              marginBottom: "1.5em",
            },
            h1: {
              fontSize: "2.25rem",
            },
            h2: {
              fontSize: "1.875rem",
            },
            h3: {
              fontSize: "1.5rem",
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};

export default config;
