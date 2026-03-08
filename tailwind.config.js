/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Stitch Decoder brand palette — warm, yarny, approachable
        brand: {
          50:  "#FDF8F2",
          100: "#F9F0E3",
          200: "#F0DFC4",
          300: "#E5C99A",
          400: "#D4A96A",
          500: "#C08040",  // primary warm amber
          600: "#A86530",
          700: "#8A4E24",
          800: "#6E3C1C",
          900: "#4F2B12",
        },
        sage: {
          50:  "#F4F7F4",
          100: "#E6EDE6",
          200: "#C9D9C9",
          300: "#A4BFA4",
          400: "#7AA07A",
          500: "#5A8060",  // secondary sage green
          600: "#456850",
          700: "#354F3D",
          800: "#27382C",
          900: "#1A241D",
        },
        cream: "#F9F5F0",
        ink: "#2C2318",
      },
      fontFamily: {
        sans:  ["System"],
        serif: ["Georgia"],
      },
    },
  },
  plugins: [],
};
