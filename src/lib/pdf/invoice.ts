import { createDoc } from './doc';
import { fontSizes, lineHeight, lineThickness } from './style';
import { cm, dateToString, formatCurrency } from './utils';

export async function createInvoice(
    localFetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>,
) {
    const { page, pdfDoc, paddings, italic, bold, width, drawCenteredText, drawSummaryTable } =
        await createDoc(localFetch);

    const drawHeader = async (data: { number: string; date: Date }) => {
        const { number, date } = data;

        const logoBytes = await localFetch('/img/logo.png').then((res) => res.arrayBuffer());
        const logoImage = await pdfDoc.embedPng(logoBytes);
        const logoDimensions = logoImage.scale(0.3);

        const logoScale = 0.425;

        page.drawImage(logoImage, {
            x: paddings.left,
            y: paddings.top - logoDimensions.height * logoScale,
            width: logoDimensions.width * logoScale,
            height: logoDimensions.height * logoScale,
            opacity: 1,
        });

        page.moveTo(
            paddings.left + logoDimensions.width * logoScale + cm(2),
            paddings.top - fontSizes.lg,
        );
        page.drawText('Коллегия\nАдвокатов\nСанкт-Петербурга', {
            size: fontSizes.lg,
            lineHeight: fontSizes.lg * 1.5,
            font: italic,
        });
        page.moveTo(
            paddings.left + logoDimensions.width * logoScale + cm(7.5),
            paddings.top - fontSizes.xl,
        );
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

        drawCenteredText(`СЧЕТ № ${number}`, bold, paddings.header - lineHeight * 10);
        drawCenteredText(dateToString(date), bold, paddings.header - lineHeight * 11);

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
    };

    const drawClientInfo = async (data: { client: string; total: number }) => {
        const { client, total } = data;
        page.moveTo(paddings.left + cm(0.25), paddings.header - lineHeight * 13);
        page.drawText('Плательщик:', { font: bold });
        page.moveDown(lineHeight);
        page.drawText(client);
        page.moveTo(cm(14) + cm(0.25), paddings.header - lineHeight * 13);
        page.drawText('Всего:', { font: bold });
        page.moveDown(lineHeight);
        page.drawText(formatCurrency(total));
        page.moveTo(paddings.left, paddings.header - lineHeight * 19);
        page.drawText('Дополнение:', { font: bold });
    };

    const drawSummary = async (data: {
        services: { title: string; price: number; amount: number }[];
    }) => {
        const { services } = data;
        const tableHeight = drawSummaryTable(
            services.map(({ title, price, amount }) => [
                title,
                amount.toString(),
                formatCurrency(price),
                formatCurrency(price * amount),
            ]),
            services.reduce((acc, { price, amount }) => acc + price * amount, 0),
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
    };

    return { drawHeader, drawClientInfo, drawSummary, pdfDoc };
}
