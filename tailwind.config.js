/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/home/index.html"], // ajusta según tu ruta real
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      // backgroundImage: {
      //   "cafe-texture": "url('/assests/bg-cafe-texture.jpg')",
      // },
    },
  },
  plugins: [],
};
