module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Mona Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        ink: "#0d1117",
        panel: "#161b22",
        edge: "#30363d",
        mist: "#c9d1d9",
        faded: "#8b949e",
        phosphor: "#d3fa37",
        good: "#2ea043",
        bad: "#f85149",
      },
    },
  },
  plugins: [],
};
