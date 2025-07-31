/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure this path covers all your component files
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      // Define textShadow directly with rgba values
      textShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.2)', // Softer shadow
        md: '0 2px 4px rgba(0, 0, 0, 0.4)', // Medium shadow, good for dark backgrounds
        lg: '0 8px 16px rgba(0, 0, 0, 0.6)', // Larger, more pronounced shadow
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // Custom plugin for text-shadow utilities
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    },
  ],
};