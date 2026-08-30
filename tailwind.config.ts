import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "var(--night)",
          2: "var(--night-2)",
        },
        panel: {
          DEFAULT: "var(--panel)",
          2: "var(--panel-2)",
        },
        line: "var(--line)",
        ember: {
          DEFAULT: "var(--ember)",
          light: "var(--ember-light)",
        },
        gold: "var(--gold)",
        ice: "var(--ice)",
        ink: {
          DEFAULT: "var(--ink)",
          dim: "var(--ink-dim)",
          faint: "var(--ink-faint)",
        },
      },
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "Cinzel", "serif"],
        serif: ["var(--font-shippori)", "Shippori Mincho B1", "serif"],
        sans: ["var(--font-outfit)", "Outfit", "sans-serif"],
      },
      aspectRatio: {
        poster: "3 / 4.2",
        banner: "16 / 9",
        "browse-card": "16 / 9.5",
      },
    },
  },
  plugins: [],
};

export default config;
