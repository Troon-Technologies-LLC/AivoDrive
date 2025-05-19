/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: '#1E1E1E',
        primary: {
          main: '#4DB6AC',
          light: '#7FE3DA',
          dark: '#348A81',
        },
        accent: {
          main: '#FFB74D',
          light: '#FFD180',
          dark: '#C88719',
        },
        text: {
          primary: '#E0E0E0',
          secondary: '#A0A0A0',
          disabled: '#707070',
        },
        error: '#CF6679',
        warning: '#FFAB40',
        info: '#64B5F6',
        success: '#81C784',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
