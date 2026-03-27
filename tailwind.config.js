/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jungle: {
          950: '#060F06',
          900: '#0D1F0D',
          800: '#142814',
          700: '#1A341A',
          600: '#234523',
          500: '#2D6A2D',
          400: '#4A9B4A',
          300: '#7DAB7D',
          200: '#B8D4B8',
          100: '#E8F5E8',
        },
        gold: {
          600: '#8B6914',
          500: '#C9A84C',
          400: '#E0C97A',
          300: '#F0DFA0',
        },
        tier: {
          seed: '#4A9B4A',
          root: '#8B6914',
          flower: '#B85C8A',
          storm: '#5A5AA0',
          guardian: '#1A7A7A',
          custodian: '#C9A84C',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'jungle-gradient': 'linear-gradient(135deg, #060F06 0%, #142814 50%, #0D1F0D 100%)',
      },
    },
  },
  plugins: [],
}
