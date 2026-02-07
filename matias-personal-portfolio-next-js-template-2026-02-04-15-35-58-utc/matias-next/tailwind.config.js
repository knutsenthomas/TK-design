/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "clr_body": "#141410",
        "clr_white": "#ffffff",
        "clr_title": "#181818",
        "clr_mtitle": "#000d27",
        "clr_pra": "#999999",
        "clr_subtitle": "#121212",
        "clr_base": "#c9f31d",
        "clr_hover": "#c2ec1d9e",
        "clr_bg1": "#e9f0ff",
        "clr_ftext": "#818181",
        "clr_footer": "#181818",
        "clr_cusborder": "rgb(38, 37, 37)",
        "clr_border1": "#414141",
        "clr_ratting": "#ffa311",
        "clr_bgsection": "#000d27",
        "clr_success": "#3fca90",
        "clr_danger": "#ed5050",
        "clr_boxes1": "rgba(26, 77, 190, 0.05)",
        "clr_cborder": "#d9d9d9"
      },

      boxShadow: {
        "mainShadow": "rgba(0, 0, 0, 0.15) 0px -1px 34px 0px"
      },
      backgroundImage: {
        "banner_image": "url('/img/banner/banner-bg.png')",
        "common_bg": "url('/img/about/about-bg.png')",
      },
      keyframes: {
        scales: {
          "0%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.4)",
          },
          "100%": {
            transform: "scale(1.5)",
            opacity: "0"
          }
        }
      },
      animation: {
        "scales": "scales 2s linear infinite"
      },
      screens: {
        ...defaultTheme.screens,
        'xxl': "1399px",

      },
      fontFamily: {
        "caveat": ["Caveat", "cursive"]
      },
      
    },
    

  },
  plugins: [],
}

