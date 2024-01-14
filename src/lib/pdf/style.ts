import { rgb, type PDFFont } from 'pdf-lib';

export const fonts: Record<string, { url: string; font?: PDFFont }> = {
    // 'Times New Roman': {
    //     url: '/fonts/times-new-roman.ttf',
    // },
    'PlayfairDisplay Regular': {
        url: '/fonts/PlayfairDisplay/PlayfairDisplay-Regular.ttf',
    },
    'PlayfairDisplay Italic': {
        url: '/fonts/PlayfairDisplay/PlayfairDisplay-Italic.ttf',
    },
    'PlayfairDisplay Bold': {
        url: '/fonts/PlayfairDisplay/PlayfairDisplay-Bold.ttf',
    },
    // 'PlayfairDisplay BlackItalic': {
    //     url: '/fonts/PlayfairDisplay/PlayfairDisplay-BlackItalic.ttf',
    // },
    // 'PlayfairDisplay Black': {
    //     url: '/fonts/PlayfairDisplay/PlayfairDisplay-Black.ttf',
    // },
    // 'PlayfairDisplay-BoldItalic': {
    //     url: '/fonts/PlayfairDisplay/PlayfairDisplay-BoldItalic.ttf',
    // },
    // 'PlayfairDisplay ExtraBold': {
    //     url: '/fonts/PlayfairDisplay/PlayfairDisplay-ExtraBold.ttf',
    // },
    // 'PlayfairDisplay ExtraBoldItalic': {
    //     url: '/fonts/PlayfairDisplay/PlayfairDisplay-ExtraBoldItalic.ttf',
    // },
    // 'PlayfairDisplay Medium': {
    //     url: '/fonts/PlayfairDisplay/PlayfairDisplay-Medium.ttf',
    // },
    // 'PlayfairDisplay MediumItalic': {
    //     url: '/fonts/PlayfairDisplay/PlayfairDisplay-MediumItalic.ttf',
    // },

    // 'PlayfairDisplay SemiBold': {
    //     url: '/fonts/PlayfairDisplay/PlayfairDisplay-SemiBold.ttf',
    // },
    // 'PlayfairDisplay SemiBoldItalic': {
    //     url: '/fonts/PlayfairDisplay/PlayfairDisplay-SemiBoldItalic.ttf',
    // },
} as const;

export const fontSizes = {
    xs: 6,
    sm: 8,
    base: 10,
    lg: 14,
    xl: 20,
    '2xl': 36,
};

export const lineHeight = fontSizes.base * 1.25;

export const lineThickness = 0.5;

export const colors = {
    black: rgb(0, 0, 0),
    white: rgb(1, 1, 1),
    // red: rgb(1, 0, 0),
    // green: rgb(0, 1, 0),
    // blue: rgb(0, 0, 1),
    // yellow: rgb(1, 1, 0),
    // cyan: rgb(0, 1, 1),
    // magenta: rgb(1, 0, 1),
    // gray: rgb(0.5, 0.5, 0.5),
    // lightGray: rgb(0.8, 0.8, 0.8),
    // darkGray: rgb(0.25, 0.25, 0.25),
    // orange: rgb(1, 0.5, 0),
    // purple: rgb(0.5, 0, 0.5),
    // brown: rgb(0.6, 0.4, 0.2),
    // pink: rgb(1, 0.753, 0.796),
    // teal: rgb(0, 0.5, 0.5),
    // olive: rgb(0.5, 0.5, 0),
    // maroon: rgb(0.5, 0, 0),
    // lime: rgb(0, 1, 0),
    // navy: rgb(0, 0, 0.5),
    // aqua: rgb(0, 1, 1),
    // silver: rgb(0.75, 0.75, 0.75),
    // violet: rgb(0.5, 0, 1),
    // oliveDrab: rgb(0.42, 0.56, 0.14),
    // darkGreen: rgb(0, 0.39, 0),
    // darkRed: rgb(0.545, 0, 0),
    // darkBlue: rgb(0, 0, 0.545),
    // darkCyan: rgb(0, 0.545, 0.545),
    // darkMagenta: rgb(0.545, 0, 0.545),
    // darkYellow: rgb(0.545, 0.545, 0),
    // lightGreen: rgb(0.6, 1, 0.6),
    // lightRed: rgb(1, 0.6, 0.6),
    // lightBlue: rgb(0.6, 0.6, 1),
    // lightCyan: rgb(0.6, 1, 1),
    // lightMagenta: rgb(1, 0.6, 1),
    // lightYellow: rgb(1, 1, 0.6),
};
