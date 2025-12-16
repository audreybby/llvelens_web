/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        biru: "#3C5070",
        birumuda: "#649CCE",
        putih: "#F7FAFF"
      },

      fontFamily: {
        aclonica: ["Aclonica", "sans-serif"],
        AS: ["Abyssinica SIL"],
        poppins: ["Poppins"]
      },
      
      fontSize: {
        base: "16px",
        sm: "14px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "30px",
        "4xl": "36px",
        "5xl": "48px",
      },
    },
  },
  plugins: [],
};
