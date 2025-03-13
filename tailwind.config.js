/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./*",
  ],
  theme: {
    extend: {
      //   backgroundImage: {
      //     "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      //     "gradient-conic":
      //       "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      //     "default-background-image": "url('/background.png')",
      //     "secondary-background-image": "url('/oval_bag_hero_1.png')",
      //   },
      //   colors: {
      //     clay_light: "#bcbcbc",
      //     clay_dark: "#3d3d3d",
      //     rust: "#b7410e",
      //     rose_dark: "#ac6e6d",
      //     rose_light: "#c57f7d",
      //     mustard: "#daaa00",
      //     gold_dark: "#fbda44",
      //     gold_light: "#ffe600",
      //     army_green: "#475320",
      //     algae: "#54B148",
      //     breadfruit: "#93fb44",
      //     denim: "#6589b0",
      //     tahiti: "#ece8e2",
      //   },
      // border: "hsl(var(--border))",
      // input: "hsl(var(--input))",
      // ring: "hsl(var(--ring))",
      //     background: "hsl(var(--background))",
      //     foreground: "hsl(var(--foreground))",
      //     primary: {
      //       DEFAULT: "hsl(var(--primary))",
      //       foreground: "hsl(var(--primary-foreground))",
      //     },
      //     secondary: {
      //       DEFAULT: "hsl(var(--secondary))",
      //       foreground: "hsl(var(--secondary-foreground))",
      //     },
      //     destructive: {
      //       DEFAULT: "hsl(var(--destructive))",
      //       foreground: "hsl(var(--destructive-foreground))",
      //     },
      //     muted: {
      //       DEFAULT: "hsl(var(--muted))",
      //       foreground: "hsl(var(--muted-foreground))",
      //     },
      //     accent: {
      //       DEFAULT: "hsl(var(--accent))",
      //       foreground: "hsl(var(--accent-foreground))",
      //     },
      //     popover: {
      //       DEFAULT: "hsl(var(--popover))",
      //       foreground: "hsl(var(--popover-foreground))",
      //     },
      //     card: {
      //       DEFAULT: "hsl(var(--card))",
      //       foreground: "hsl(var(--card-foreground))",
      //     },
      //   },
      //   borderRadius: {
      //     lg: "var(--radius)",
      //     md: "calc(var(--radius) - 2px)",
      //     sm: "calc(var(--radius) - 4px)",
      //   },
      // keyframes: {
      //   "accordion-down": {
      //     from: { height: "0" },
      //     to: { height: "var(--radix-accordion-content-height)" },
      //   },
      //   "accordion-up": {
      //     from: { height: "var(--radix-accordion-content-height)" },
      //     to: { height: "0" },
      //   },
      // },
      // animation: {
      //     "accordion-down": "accordion-down 0.2s ease-out",
      //     "accordion-up": "accordion-up 0.2s ease-out",
      // },

      animation: {
        tilt: "tilt 3s linear infinite",
      },
      keyframes: {
        tilt: {
          "0%, 50%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(0.5deg)" },
          "75%": { transform: "rotate(-0.5deg)" },
        },
      },

      translate: {
        4.25: "17rem",
      },

      variants: {
        extend: {
          backdropSaturate: ["hover", "focus"],
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
