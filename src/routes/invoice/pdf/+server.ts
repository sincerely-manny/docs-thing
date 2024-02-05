import db from '$lib/db/client';
import { clients, invoices, services } from '$lib/db/schema';
import { createInvoice } from '$lib/pdf/invoice';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch: localFetch, url }) => {
    const invoiceId = url.searchParams.get('invoiceId');
    if (!invoiceId) {
        return new Response();
    }
    const rows = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, invoiceId))
        .leftJoin(services, eq(invoices.id, services.invoiceId))
        .leftJoin(clients, eq(invoices.clientId, clients.id));
    if (!rows.length) {
        return new Response();
    }
    const invoice = {
        ...rows[0].invoices,
        services: rows.map(({ services }) => services),
        client: rows[0].clients,
    };

    const { pdfDoc, drawClientInfo, drawHeader, drawSummary } = await createInvoice(localFetch);

    await drawHeader({ number: invoice.number, date: new Date(invoice.date || '') });
    await drawClientInfo({
        client: `${invoice.client?.opf}\n«${invoice.client?.name}»`,
        total: invoice.services.reduce(
            (acc, service) => acc + parseFloat(service?.price || '') * (service?.amount || 1),
            0,
        ),
    });
    await drawSummary({
        services: invoice.services.map((service) => ({
            title: service?.title || '',
            amount: service?.amount || 0,
            price: parseFloat(service?.price || ''),
        })),
    });

    const pdfBytes = await pdfDoc.save();
    const downloadOrView = {
        download: 'attachment',
        view: 'inline',
    };

    const filename = `Invoice_#${invoice.number}_(${new Date(invoice.date || '').toLocaleDateString(
        'ru-Ru',
    )})`;

    return new Response(pdfBytes, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `${downloadOrView.view}; filename=${filename}.pdf`,
        },
    });
};
