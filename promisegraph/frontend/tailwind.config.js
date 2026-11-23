/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5146E5',
          hover: '#4338CA',
          light: '#EEF0FD',
          50: '#F5F6FE',
          100: '#EEF0FD',
          500: '#5146E5',
          600: '#4338CA',
          700: '#3730A3',
        },
        surface: {
          main: '#F5F7FF',
          card: '#FFFFFF',
          sidebar: '#FFFFFF',
          muted: '#F8F9FD',
        },
        navy: {
          900: '#172044',
          800: '#232D58',
          700: '#323E6D',
        },
        slate: {
          500: '#64708B',
          600: '#4F5D7B',
        },
        status: {
          success: '#24B8A5',
          'success-light': '#E6F8F5',
          warning: '#F2B84B',
          'warning-light': '#FEF7EC',
          danger: '#E66D68',
          'danger-light': '#FDF1F0',
        },
        border: {
          DEFAULT: '#E8EAF3',
          light: '#F0F2F9',
        }
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(23, 32, 68, 0.05), 0 1px 4px -1px rgba(23, 32, 68, 0.03)',
        'card-hover': '0 10px 25px -4px rgba(81, 70, 229, 0.09), 0 4px 10px -2px rgba(23, 32, 68, 0.04)',
        'nav': '0 1px 3px 0 rgba(23, 32, 68, 0.04)',
        'subtle': '0 1px 2px 0 rgba(23, 32, 68, 0.03)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
