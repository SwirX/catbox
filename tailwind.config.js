module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      colors: {
        // Apple-inspired distinct dark grays
        apple: {
          base: "#000000",
          card: "#1C1C1E",
          hover: "#2C2C2E",
          border: "#38383A",
          blue: "#0A84FF",
        }
      }
    },
  },
  plugins: [],
};
