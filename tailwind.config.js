/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // KRDS Primary: #256ef4 (primary-50)
      colors: {
        primary: {
          DEFAULT: '#256ef4',
          hover:   '#0b50d0',
          pressed: '#083891',
          light:   '#ecf2fe',
          lighter: '#d8e5fd',
        },
        secondary: {
          DEFAULT: '#346fb2',
          light:   '#eef2f7',
        },
        // KRDS semantic text
        'text-basic':    '#1e2124',
        'text-subtle':   '#464c53',
        'text-disabled': '#8a949e',
        // KRDS semantic bg
        'bg-page':    '#f4f5f6',
        'bg-surface': '#ffffff',
        'bg-subtle':  '#e6e8ea',
        // KRDS border
        'border-light':  '#cdd1d5',
        'border-default':'#b1b8be',
        'border-strong': '#58616a',
        // KRDS status
        success: {
          DEFAULT: '#228738',
          light:   '#eaf6ec',
          text:    '#267337',
        },
        danger: {
          DEFAULT: '#de3412',
          light:   '#fdefec',
          text:    '#bd2c0f',
        },
        warning: {
          DEFAULT: '#ffb114',
          light:   '#fff3db',
          text:    '#8a5c00',
        },
        info: {
          DEFAULT: '#0b78cb',
          light:   '#e7f4fe',
          text:    '#096ab3',
        },
        // Category colors (KRDS-aligned)
        finance:    '#256ef4',
        housing:    '#7c3aed',
        employment: '#228738',
        education:  '#9e6a00',
        culture:    '#d63d4a',
      },
      // KRDS radius scale (number-* × 10px base)
      borderRadius: {
        none: '0',
        xs:   '0.2rem',  // number-2 = 2px
        sm:   '0.4rem',  // number-3 = 4px
        DEFAULT: '0.6rem', // number-4 = 6px
        md:   '0.8rem',  // number-5 = 8px
        lg:   '1rem',    // number-6 = 10px
        xl:   '1.2rem',  // number-7 = 12px
        '2xl':'1.6rem',  // number-8 = 16px
        full: '100rem',
      },
      // KRDS font
      fontFamily: {
        sans: [
          'Pretendard GOV',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      // KRDS mobile type scale (10px base)
      fontSize: {
        'xs':   ['1.3rem', { lineHeight: '1.8rem' }],  // body-xsmall
        'sm':   ['1.5rem', { lineHeight: '2.2rem' }],  // body-small
        'base': ['1.7rem', { lineHeight: '2.6rem' }],  // body-medium
        'lg':   ['1.9rem', { lineHeight: '2.8rem' }],  // heading-small
        'xl':   ['2.2rem', { lineHeight: '3.2rem' }],  // heading-medium
        '2xl':  ['2.4rem', { lineHeight: '3.6rem' }],  // heading-large
        '3xl':  ['2.8rem', { lineHeight: '4rem'   }],  // heading-xlarge
      },
      // KRDS spacing (number scale)
      spacing: {
        '0':  '0',
        '1':  '0.4rem',  // number-3 = 4px
        '2':  '0.8rem',  // number-5 = 8px
        '3':  '1.2rem',  // number-7 = 12px
        '4':  '1.6rem',  // number-8 = 16px
        '5':  '2rem',    // number-9 = 20px
        '6':  '2.4rem',  // number-10 = 24px
        '7':  '2.8rem',  // number-11 = 28px
        '8':  '3.2rem',  // number-12 = 32px
        '9':  '3.6rem',
        '10': '4rem',    // number-14 = 40px
        '11': '4.4rem',  // button height mobile
        '12': '4.8rem',  // number-16 = 48px
        '14': '5.6rem',
        '16': '6.4rem',
        '20': '8rem',
        '24': '9.6rem',
        '28': '11.2rem',
        '32': '12.8rem',
        '36': '14.4rem',
        '40': '16rem',
        '44': '17.6rem',
        '48': '19.2rem',
        '56': '22.4rem',
        '64': '25.6rem',
        '72': '28.8rem',
        '80': '32rem',
        'px': '1px',
        '0.5': '0.2rem',
      },
      // KRDS shadow
      boxShadow: {
        sm:  '0 0.1rem 0.4rem var(--krds-light-color-alpha-shadow1, #0000000d)',
        DEFAULT: '0 0.2rem 0.8rem var(--krds-light-color-alpha-shadow2, #00000014)',
        md:  '0 0.4rem 1.2rem var(--krds-light-color-alpha-shadow3, #0000001f)',
        none: 'none',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(1.6rem)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
