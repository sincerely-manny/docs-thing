// /** @type {import('tailwindcss').Config} */
// const defaultTheme = require('tailwindcss/defaultTheme');

import defaultTheme from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss/types/config';
import flowbite from 'flowbite/plugin';

export default {
    content: [
        './src/**/*.{html,js,svelte,ts}',
        './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
    ],
    plugins: [flowbite],
    // darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Roboto Flex"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // flowbite-svelte
                primary: {
                    50: '#FFF5F2',
                    100: '#FFF1EE',
                    200: '#FFE4DE',
                    300: '#FFD5CC',
                    400: '#FFBCAD',
                    500: '#FE795D',
                    600: '#EF562F',
                    700: '#EB4F27',
                    800: '#CC4522',
                    900: '#A5371B',
                },
            },
            aria: {
                current: 'current="true"',
            },
        },
    },
} satisfies Config;