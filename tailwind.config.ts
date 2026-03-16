import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#102033",
        mist: "#eef3f7",
        signal: "#0f766e",
        warn: "#b45309",
        danger: "#b91c1c",
        accent: "#155eef"
      },
      boxShadow: {
        panel: "0 20px 45px rgba(16, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
