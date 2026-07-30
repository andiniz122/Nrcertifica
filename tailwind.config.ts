import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red:     '#E0612A', // laranja principal NR Certifica
          dark:    '#1B222A', // ardósia cabeçalho
          navy:    '#14191F', // ardósia profunda
          gold:    '#F5915F', // laranja claro
          light:   '#F7F4F1', // fundo de página
          hero:    '#FAF7F3', // off-white hero
          border:  '#ECE6E0', // borda / linha
          slate:   '#232B34', // ardósia texto
          muted:   '#6B727A', // cinza secundário
          success: '#2F9E6F', // verde sucesso
          soft:    '#FAE9DF', // fundo suave / badges
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
