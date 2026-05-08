/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0033CC",
          primaryDark: "#001a66",
          accent: "#FF8A00",
          canvas: "#F4F6F8",
        },
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card: "0 4px 14px rgba(0, 26, 102, 0.08)",
      },
    },
  },
  plugins: [],
};

module.exports = config;
