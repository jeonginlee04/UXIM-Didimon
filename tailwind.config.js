/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#52A882',
          hover:   '#3E9069',
          pressed: '#2E7A57',
          light:   '#EBF5EF',
          lighter: '#D6EDE3',
        },
        'text-basic':    '#1C1C1E',
        'text-subtle':   '#6B7280',
        'text-disabled': '#9CA3AF',
        'bg-page':    '#F5F6F7',
        'bg-surface': '#FFFFFF',
        'bg-subtle':  '#F0F1F2',
        'border-light':   '#E5E7EB',
        'border-default': '#D1D5DB',
        'border-strong':  '#6B7280',
        success: {
          DEFAULT: '#22C55E',
          light:   '#DCFCE7',
          text:    '#15803D',
        },
        danger: {
          DEFAULT: '#EF4444',
          light:   '#FEE2E2',
          text:    '#B91C1C',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light:   '#FEF3C7',
          text:    '#92400E',
        },
        info: {
          DEFAULT: '#3B82F6',
          light:   '#EFF6FF',
          text:    '#1D4ED8',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['12px', { lineHeight: '18px' }],
        'sm':   ['14px', { lineHeight: '22px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg':   ['18px', { lineHeight: '28px' }],
        'xl':   ['20px', { lineHeight: '30px' }],
        '2xl':  ['24px', { lineHeight: '34px' }],
        '3xl':  ['30px', { lineHeight: '40px' }],
      },
      borderRadius: {
        'none': '0',
        'sm':   '6px',
        DEFAULT:'8px',
        'md':   '10px',
        'lg':   '12px',
        'xl':   '16px',
        '2xl':  '20px',
        'full': '9999px',
      },
      boxShadow: {
        'sm':  '0 1px 3px rgba(0,0,0,0.08)',
        DEFAULT: '0 2px 8px rgba(0,0,0,0.1)',
        'md':  '0 4px 12px rgba(0,0,0,0.12)',
        'lg':  '0 8px 24px rgba(0,0,0,0.15)',
        'none': 'none',
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
