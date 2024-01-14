import type { RequestHandler } from './$types';
import { PDFDocument, PDFFont, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export const GET: RequestHandler = async ({ fetch: localFetch }) => {
    const cm = (n: number) => parseFloat(((n * 72) / 2.54).toFixed(2));
    const fonts: Record<string, { url: string; font?: PDFFont }> = {
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
        'PlayfairDisplay BlackItalic': {
            url: '/fonts/PlayfairDisplay/PlayfairDisplay-BlackItalic.ttf',
        },
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

    const fontSizes = {
        xs: 6,
        sm: 8,
        base: 10,
        lg: 14,
        xl: 20,
        '2xl': 36,
    };
    const lineHeight = fontSizes.base * 1.25;
    const lineThickness = 0.5;
    const colors = {
        black: rgb(0, 0, 0),
        white: rgb(1, 1, 1),
        red: rgb(1, 0, 0),
        green: rgb(0, 1, 0),
        blue: rgb(0, 0, 1),
        yellow: rgb(1, 1, 0),
        cyan: rgb(0, 1, 1),
        magenta: rgb(1, 0, 1),
        gray: rgb(0.5, 0.5, 0.5),
        lightGray: rgb(0.8, 0.8, 0.8),
        darkGray: rgb(0.25, 0.25, 0.25),
        orange: rgb(1, 0.5, 0),
        purple: rgb(0.5, 0, 0.5),
        brown: rgb(0.6, 0.4, 0.2),
        pink: rgb(1, 0.753, 0.796),
        teal: rgb(0, 0.5, 0.5),
        olive: rgb(0.5, 0.5, 0),
        maroon: rgb(0.5, 0, 0),
        lime: rgb(0, 1, 0),
        navy: rgb(0, 0, 0.5),
        aqua: rgb(0, 1, 1),
        silver: rgb(0.75, 0.75, 0.75),
        violet: rgb(0.5, 0, 1),
        oliveDrab: rgb(0.42, 0.56, 0.14),
        darkGreen: rgb(0, 0.39, 0),
        darkRed: rgb(0.545, 0, 0),
        darkBlue: rgb(0, 0, 0.545),
        darkCyan: rgb(0, 0.545, 0.545),
        darkMagenta: rgb(0.545, 0, 0.545),
        darkYellow: rgb(0.545, 0.545, 0),
        lightGreen: rgb(0.6, 1, 0.6),
        lightRed: rgb(1, 0.6, 0.6),
        lightBlue: rgb(0.6, 0.6, 1),
        lightCyan: rgb(0.6, 1, 1),
        lightMagenta: rgb(1, 0.6, 1),
        lightYellow: rgb(1, 1, 0.6),
    };

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    for (const [name, { url }] of Object.entries(fonts)) {
        const fontBytes = await localFetch(url).then((res) => res.arrayBuffer());
        fonts[name].font = await pdfDoc.embedFont(fontBytes);
        if (!fonts[name].font) {
            throw new Error(`Failed to embed font: ${name}`);
        }
    }
    const bold = fonts['PlayfairDisplay Bold'].font;
    const italic = fonts['PlayfairDisplay Italic'].font;
    const regular = fonts['PlayfairDisplay Regular'].font;
    const boldItalic = fonts['PlayfairDisplay BlackItalic'].font;

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const paddings = {
        top: height - cm(2),
        right: cm(1.5),
        bottom: cm(2),
        left: cm(1.5),
        header: height - cm(6),
    };

    page.setFont(regular!);
    page.setFontSize(fontSizes.base);
    page.setFontColor(colors.black);
    page.setLineHeight(lineHeight);

    const drawCenteredText = (text: string, font: (typeof fonts)[string]['font'], top: number) => {
        if (!font) {
            throw new Error('Error loading font');
        }
        const textWidth = font.widthOfTextAtSize(text, fontSizes.base);
        page.moveTo(width / 2 - textWidth / 2, top);
        page.drawText(text, { font });
    };

    const drawSummaryTable = (data: [string, string, string, string][], top: number) => {
        const cellPadding = cm(0.25);
        const colWidth = [cm(9), cm(2), cm(3.5)];
        const rows: typeof data = [
            ['Наименование', 'Кол-во', 'Цена', 'Сумма'],
            ...data,
            ['', '', '', ''],
            ['НДС не облагается', '', '', ''],
            ['Итого к оплате', '', '', ''],
        ];
        const rowHeights = new Array(rows.length).fill(1);
        rows.forEach((row, rowNum) => {
            row.forEach((cell, colNum) => {
                const cellWidth = regular!.widthOfTextAtSize(cell, fontSizes.base);
                if (cellWidth > colWidth[colNum] - cellPadding * 2) {
                    const cellArr = cell.split(' ');
                    let lines: string[][] = [[]];
                    let lineCount = 0;
                    cellArr.forEach((word) => {
                        if (
                            regular!.widthOfTextAtSize(
                                [...lines[lineCount], word].join(' '),
                                fontSizes.base,
                            ) <
                            colWidth[colNum] - cellPadding * 2
                        ) {
                            lines[lineCount].push(word);
                        } else {
                            lines.push([]);
                            lines[++lineCount].push(word);
                        }
                    });
                    rowHeights[rowNum] = Math.max(rowHeights[rowNum], lines.length);
                    rows[rowNum][colNum] = lines.map((line) => line.join(' ')).join('\n');
                } else {
                    rowHeights[rowNum] = Math.max(rowHeights[rowNum], 1);
                }
            });
        });
        const tableHeight = (rowHeights.reduce((acc, height) => acc + height, 0) + 1) * lineHeight;
        page.moveTo(paddings.left, top);
        page.drawRectangle({
            x: paddings.left,
            y: top,
            width: width - paddings.left - paddings.right,
            height: 0 - tableHeight,
            borderColor: colors.black,
            borderWidth: lineThickness,
            opacity: 0,
        });
        {
            let acc = 0;
            colWidth.forEach((cellWidth) => {
                acc += cellWidth;
                page.drawLine({
                    start: { x: paddings.left + acc, y: top - tableHeight + lineHeight },
                    end: { x: paddings.left + acc, y: top },
                    thickness: lineThickness,
                });
            });
        }
        let y = top;
        for (let i = 0; i < rows.length; i++) {
            y -= rowHeights[i] * lineHeight;
            page.drawLine({
                start: { x: paddings.left, y },
                end: { x: width - paddings.right, y },
                thickness: lineThickness,
            });
            page.moveTo(
                paddings.left + cellPadding,
                y + lineHeight * (rowHeights[i] - 1) + cm(0.1),
            );
            rows[i].forEach((cell, j) => {
                page.drawText(cell, {
                    ...(i === 0 || i === rows.length - 2 || i === rows.length - 1
                        ? { font: bold }
                        : {}),
                    lineHeight: lineHeight * 0.85,
                });
                page.moveRight(colWidth[j] || 0 + cellPadding);
            });
        }
        const totalString = 'Тридцать тысяч рублей';
        drawCenteredText(totalString, italic, top - tableHeight + cm(0.1));
        return tableHeight;
    };

    const logoBytes = await localFetch('/img/logo.png').then((res) => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDimensions = logoImage.scale(0.3);

    page.drawImage(logoImage, {
        x: paddings.left,
        y: paddings.top - logoDimensions.height,
        width: logoDimensions.width,
        height: logoDimensions.height,
        opacity: 1,
    });

    page.moveTo(paddings.left + logoDimensions.width + cm(2), paddings.top - fontSizes.lg);
    page.drawText('Коллегия\nАдвокатов\nСанкт-Петербурга', {
        size: fontSizes.lg,
        lineHeight: fontSizes.lg * 1.5,
        font: italic,
    });
    page.moveTo(paddings.left + logoDimensions.width + cm(7.5), paddings.top - fontSizes.xl);
    page.drawText('Бизнес-коллегия', {
        size: fontSizes.xl,
        font: italic,
    });
    page.moveDown(fontSizes['2xl']);
    page.drawText('«АСТЭР»', {
        size: fontSizes['2xl'],
        font: italic,
    });

    page.moveTo(paddings.left, paddings.header);
    page.drawText('Поставщик: Коллегия адвокатов Санкт-Петербурга «Бизнес-коллегия «АСТЭР»');
    page.moveDown(lineHeight * 2);
    page.drawText('191186, Санкт-Петербург, Невский  пр., д. 30, оф. 6.11');
    page.moveDown(lineHeight);
    page.drawText('Центральное ОСБ № 1991/0786', { font: bold });
    page.moveDown(lineHeight);
    page.drawText('Северо-Западный банк ПАО Сбербанк', {
        font: bold,
    });
    page.moveTo(paddings.left + cm(10), paddings.header - lineHeight * 2);
    page.drawText('ИНН:', { font: bold });
    page.moveRight(fontSizes.base * 3);
    page.drawText('7841000153');
    page.moveRight(fontSizes.base * 5.5);
    page.drawText('КПП:', { font: bold });
    page.moveRight(fontSizes.base * 3);
    page.drawText('784101001');
    page.moveTo(paddings.left + cm(10), paddings.header - lineHeight * 3);
    page.drawText('р/с:', { font: bold });
    page.moveRight(fontSizes.base * 3);
    page.drawText('40703810555230109434');
    page.moveTo(paddings.left + cm(10), paddings.header - lineHeight * 4);
    page.drawText('к/с:', { font: bold });
    page.moveRight(fontSizes.base * 3);
    page.drawText('30101810500000000653');
    page.moveRight(fontSizes.base * 11);
    page.drawText('БИК:', { font: bold });
    page.moveRight(fontSizes.base * 3);
    page.drawText('044030653');
    page.drawLine({
        start: { x: paddings.left, y: paddings.header - lineHeight * 5 },
        end: { x: width - paddings.right, y: paddings.header - lineHeight * 5 },
        thickness: lineThickness,
    });
    page.moveTo(paddings.left, paddings.header - lineHeight * 6);
    page.drawText('Отправитель он же\nПолучатель  он же');
    page.drawLine({
        start: { x: paddings.left, y: paddings.header - lineHeight * 7.7 },
        end: { x: width - paddings.right, y: paddings.header - lineHeight * 7.7 },
        thickness: lineThickness,
    });

    drawCenteredText('СЧЕТ № 96', bold, paddings.header - lineHeight * 10);
    drawCenteredText('«20» декабря 2023 года', bold, paddings.header - lineHeight * 11);

    page.drawRectangle({
        x: paddings.left,
        y: paddings.header - lineHeight * 12,
        width: width - paddings.left - paddings.right,
        height: 0 - lineHeight * 4,
        borderWidth: lineThickness,
        opacity: 0,
    });

    page.drawLine({
        start: { x: cm(14), y: paddings.header - lineHeight * 12 },
        end: { x: cm(14), y: paddings.header - lineHeight * 16 },
        thickness: lineThickness,
    });

    page.moveTo(paddings.left + cm(0.25), paddings.header - lineHeight * 13);
    page.drawText('Плательщик:', { font: bold });
    page.moveDown(lineHeight);
    page.drawText('Индивидуальный предприниматель\nШнурова Матильда Владимировна');
    page.moveTo(cm(14) + cm(0.25), paddings.header - lineHeight * 13);
    page.drawText('Всего:', { font: bold });
    page.moveDown(lineHeight);
    page.drawText('30 000,00 руб.');
    page.moveTo(paddings.left, paddings.header - lineHeight * 19);
    page.drawText('Дополнение:', { font: bold });

    const tableHeight = drawSummaryTable(
        [
            [
                'Консультации по вопросам налогового права и прочая ерунда',
                '1',
                '30 000,00 руб.',
                '30 000,00 руб.',
            ],
        ],
        paddings.header - lineHeight * 20,
    );
    page.moveTo(paddings.left + cm(7), paddings.header - lineHeight * 24 - tableHeight);
    page.drawText('Председатель коллегии');
    page.drawLine({
        start: {
            x: paddings.left + cm(11.05),
            y: paddings.header - lineHeight * 23 - tableHeight - lineHeight - cm(0.05),
        },
        end: {
            x: paddings.left + cm(14.9),
            y: paddings.header - lineHeight * 23 - tableHeight - lineHeight - cm(0.05),
        },
        thickness: lineThickness,
    });
    page.moveTo(paddings.left + cm(15), paddings.header - lineHeight * 24 - tableHeight);
    page.drawText('/ Воробьева И.Б. /');
    page.moveTo(
        paddings.left + cm(12.7),
        paddings.header - lineHeight * 25 - tableHeight + fontSizes.xs,
    );
    page.drawText('м.п.', { size: fontSizes.xs });

    const pdfBytes = await pdfDoc.save();
    const downloadOrView = {
        download: 'attachment',
        view: 'inline',
    };
    return new Response(pdfBytes, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `${downloadOrView.view}; filename=example.pdf`,
        },
    });
};
