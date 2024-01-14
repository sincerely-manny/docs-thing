import type { RequestHandler } from './$types';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export const GET: RequestHandler = async ({ fetch: localFetch }) => {
    const url = '/times-new-roman.ttf';
    const fontBytes = await localFetch(url).then((res) => res.arrayBuffer());

    const pdfDoc = await PDFDocument.create();

    pdfDoc.registerFontkit(fontkit);

    const ubuntuFont = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 30;
    page.drawText('Привет мир!', {
        x: 50,
        y: height - 4 * fontSize,
        size: fontSize,
        font: ubuntuFont,
        color: rgb(0, 0.53, 0.71),
    });
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
