/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat'],
        'montserrat-bold': ['Montserrat-Bold'],
        'space-mono': ['SpaceMono'],
        'love-light': ['LoveLight'],
        'marcellus': ['Marcellus'],
      },
    },
  },
  plugins: [],
  nativewind: {
    styledComponents: ['LinearGradient'],
  },
}