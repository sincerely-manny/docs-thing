import type { RequestHandler } from './$types';
import { PDFDocument, PDFFont, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { createInvoice } from '$lib/pdf/invoice';
import { convert } from 'pdf-img-convert';

export const GET: RequestHandler = async ({ fetch: localFetch }) => {
    const { pdfDoc, drawClientInfo, drawHeader, drawSummary } = await createInvoice(localFetch);

    await drawHeader({ number: '12345', date: new Date() });
    await drawClientInfo({ client: 'Client Name', total: 30000 });
    await drawSummary({
        services: [
            { title: 'Фигня 1', amount: 1, price: 10000 },
            { title: 'Item 2', amount: 2, price: 20000 },
            {
                title: 'dsakl;dksal; dls;adl;las dsalk;dk;alsk;ld dl;wkdl;s',
                amount: 1,
                price: 3213.43,
            },
        ],
    });

    const pdfBytes = await pdfDoc.save();
    const downloadOrView = {
        download: 'attachment',
        view: 'inline',
    };

    // const preview = await convert(pdfBytes, { width: 300, base64: true });

    return new Response(pdfBytes, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `${downloadOrView.view}; filename=example.pdf`,
        },
    });
};
