import db from '$lib/db/client';
import { clients, invoices, services } from '$lib/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { dateToString, formatCurrency } from '$lib/pdf/utils';

export const GET: RequestHandler = async ({ url }) => {
    const invoiceId = url.searchParams.get('invoiceId');
    if (!invoiceId) {
        throw error(400, 'Query string is reqired');
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

    const total = invoice.services.reduce(
        (acc, service) => acc + Number(service?.price || 0) * Number(service?.amount || 1),
        0,
    );

    const data = {
        number: invoice.number,
        date: new Date(invoice.date || ''),
        dateString: dateToString(new Date(invoice.date || '')),
        client: `${invoice.client?.opf} «${invoice.client?.name}»`,
        total,
        totalFormatted: formatCurrency(total),
        services: invoice.services.map((service) => ({
            title: service?.title || '',
            amount: service?.amount || 1,
            price: parseFloat(service?.price || ''),
        })),
    };

    return new Response(JSON.stringify(data), {
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=3600',
        },
    });
};
