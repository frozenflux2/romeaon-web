/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withMT = require('@material-tailwind/react/utils/withMT')

module.exports = withMT({
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            animation: {
                animationDelay: {
                    2500: '2500ms',
                    3500: '3500ms',
                },
            },
            colors: {
                publicPageBlack: `var(--public-page-black)`,
                publicPageWhite: `var(--public-page-white)`,
                publicPageBorder: `var(--public-page-border)`,
                publicDashboardBg: `var(--public-dashboard-bg)`,
                publicDashboardText: `var(--public-dashboard-text)`,
                publicSidebarBg: `var(--public-sidebar-bg)`,
                publicSidebarText: `var(--public-sidebar-text)`,
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('tailwindcss-animation-delay'),
    ],
})
