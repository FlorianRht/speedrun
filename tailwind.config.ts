import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#241F3A",
        berry: "#8B2E6B",
        sky: "#4AB3C8",
        cream: "#FBF7F0",
        gold: "#E8B84B",
      },
      fontFamily: {
        display: ["'Poppins'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
