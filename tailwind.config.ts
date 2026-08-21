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
          red:     '#E97824', // laranja principal NR Certifica (CTA)
          redDark: '#CE6415', // laranja hover
          dark:    '#0E1B2B', // navy do cabeçalho / hero
          navy:    '#091320', // navy profundo (rodapé / faixas)
          panel:   '#16273C', // cartões sobre fundo navy
          gold:    '#FFC93C', // amarelo de destaque do título
          light:   '#EFF2F6', // fundo de página
          hero:    '#F7F9FC', // off-white de seções claras
          border:  '#E2E7EE', // borda / linha
          slate:   '#1A2433', // texto principal
          muted:   '#5B6779', // cinza secundário
          success: '#25A16B', // verde sucesso
          soft:    '#FDEEE2', // fundo suave / badges laranja
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,27,43,.06), 0 8px 24px -12px rgba(16,27,43,.18)',
        float: '0 18px 45px -20px rgba(9,19,32,.45)',
      },
    },
  },
  plugins: [],
}

export default config
