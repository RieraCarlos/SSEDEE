// tailwind.config.js - Configuración sugerida para paleta Dark Modern High-End

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Dark Modern High-End
        'primary-bg': '#13161c',      // Fondo Base
        'secondary-bg': '#1d2029',    // Contenedores/Tarjetas
        'accent': '#0ae98a',          // Acciones/Resaltados

        // Variantes para gradientes y transparencias
        'primary-bg-alpha': {
          50: '#13161c80',   // 50% opacity
          20: '#13161c33',   // 20% opacity
          10: '#13161c1a',   // 10% opacity
        },
        'secondary-bg-alpha': {
          50: '#1d202980',
          20: '#1d202933',
          10: '#1d20291a',
        },
        'accent-alpha': {
          50: '#0ae98a80',
          20: '#0ae98a33',
          10: '#0ae98a1a',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'], // Fuente moderna
        'display': ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-accent': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-accent': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(10, 233, 138, 0.1)' },
          '100%': { boxShadow: '0 0 30px rgba(10, 233, 138, 0.3)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    // Plugin para merge de clases (opcional pero recomendado)
    require('tailwind-merge'),
  ],
}