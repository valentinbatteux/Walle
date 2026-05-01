/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream:  '#EFF4FF',
        neon:   '#6FFF00',
        space:  '#010828',
      },
      fontFamily: {
        grotesk:   ['Anton', 'sans-serif'],
        condiment: ['Condiment', 'cursive'],
        sans:      ['ui-monospace', 'SFMono-Regular', 'monospace'],
        body:      ['Barlow', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
