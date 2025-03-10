/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(0, 0, 0)',
        primary: 'rgb(139, 92, 246)',
        secondary: 'rgb(59, 130, 246)',
        'primary-foreground': 'rgb(255, 255, 255)',
        'secondary-foreground': 'rgb(255, 255, 255)',
        destructive: 'rgb(239, 68, 68)',
        'destructive-foreground': 'rgb(255, 255, 255)',
        muted: 'rgb(107, 114, 128)',
        'muted-foreground': 'rgb(156, 163, 175)',
        accent: 'rgb(176, 132, 246)',
        'accent-foreground': 'rgb(255, 255, 255)',
        input: 'rgb(75, 85, 99)',
        ring: 'rgb(139, 92, 246)'
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
};