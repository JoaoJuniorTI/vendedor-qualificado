/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* Paleta inspirada no estilo Apple: tons neutros + azul como cor de ação */
      colors: {
        brand: {
          50:  '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36aaf5',
          500: '#0c8ee6',  /* Cor principal de ação */
          600: '#006fc4',
          700: '#00599f',
          800: '#054c83',
          900: '#0a406d',
        },
        surface: {
          50:  '#fafafa',
          100: '#f5f5f7',  /* Fundo Apple */
          200: '#e8e8ed',
          300: '#d2d2d7',
          400: '#86868b',  /* Texto secundário Apple */
          500: '#6e6e73',
          600: '#424245',
          700: '#333336',
          800: '#1d1d1f',  /* Texto principal Apple */
          900: '#111111',
        },
        positiva: {
          light: '#ecfdf5',
          DEFAULT: '#10b981',
          dark: '#065f46',
        },
        negativa: {
          light: '#fef2f2',
          DEFAULT: '#ef4444',
          dark: '#991b1b',
        },
        neutra: {
          light: '#f5f5f7',
          DEFAULT: '#86868b',
          dark: '#424245',
        },
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          'SF Pro Text',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '16px',
        'apple-xl': '20px',
      },
      boxShadow: {
        'apple': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'apple-md': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'apple-lg': '0 8px 30px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
        'apple-xl': '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
