import { PDFDocument } from 'pdf-lib';
import { colors, fontSizes, fonts, lineHeight, lineThickness } from './style';
import fontkit from '@pdf-lib/fontkit';
import { cm, formatCurrency } from './utils';
import { format } from '@vicimpa/rubles';

export const createDoc = async (
    localFetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>,
) => {
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

    const drawCenteredText = (
        text: string,
        font: (typeof fonts)[string]['font'],
        top: number,
        fontSize = fontSizes.base,
    ) => {
        if (!font) {
            throw new Error('Error loading font');
        }
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        page.moveTo(width / 2 - textWidth / 2, top);
        page.drawText(text, { font, size: fontSize });
    };

    const drawSummaryTable = (
        data: [string, string, string, string][],
        totalSum: number,
        top: number,
    ) => {
        const cellPadding = cm(0.25);
        const colWidth = [cm(9), cm(2), cm(3.5)];
        const rows: typeof data = [
            ['Наименование', 'Кол-во', 'Цена', 'Сумма'],
            ...data,
            ['', '', '', ''],
            ['НДС не облагается', '', '', ''],
            ['Итого к оплате', '', '', formatCurrency(totalSum)],
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
        const totalString = format(totalSum);
        drawCenteredText(totalString, italic, top - tableHeight + cm(0.1), fontSizes.sm);
        return tableHeight;
    };

    return {
        pdfDoc,
        page,
        paddings,
        bold,
        italic,
        regular,
        width,
        height,
        drawCenteredText,
        drawSummaryTable,
    };
};
