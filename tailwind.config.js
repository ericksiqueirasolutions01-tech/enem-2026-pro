/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d8eeff',
          200: '#b9e2ff',
          300: '#89d1ff',
          400: '#52b7ff',
          500: '#2a97ff',
          600: '#0d77f8',
          700: '#0b60e4',
          800: '#0f4cb8',
          900: '#134290',
          950: '#0b2759',
        },
        enem: {
          linguagens: '#ec4899',   // Rosa/Magenta
          humanas: '#f59e0b',      // Âmbar/Laranja
          natureza: '#10b981',     // Esmeralda/Verde
          matematica: '#3b82f6',   // Azul
          redacao: '#8b5cf6',      // Roxo
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        xs: '2px',
      },
      spacing: {
        '0.2': '0.05rem',
        '13': '3.25rem',
      },
      maxWidth: {
        'container-landing': '1200px',
      },
    },
  },
  plugins: [],
}
