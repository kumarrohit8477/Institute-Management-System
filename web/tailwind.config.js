/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary, #3b82f6)",
          hover: "var(--color-primary-hover, #2563eb)",
          light: "var(--color-primary-light, #eff6ff)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm, 6px)",
        md: "var(--radius-md, 10px)",
        lg: "var(--radius-lg, 16px)",
      },
    },
  },
  plugins: [],
};
