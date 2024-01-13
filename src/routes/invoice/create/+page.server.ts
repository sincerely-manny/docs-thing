import db from '$lib/db/client';
import { invoicesInsertSchema } from '$lib/db/schema';
import { type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import type { z } from 'zod';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
    const clientId = url.searchParams.get('clientId') || '';
    const clients = await db.query.clients.findMany({
        orderBy: (clients, { asc }) => [asc(clients.name)],
    });

    const currentYear = new Date().getFullYear;

    const latestInvoice = await db.query.invoices.findFirst({
        where: (invoices, { between }) =>
            between(invoices.date, currentYear + '-01-01', currentYear + '-12-31'),
        orderBy: (invoices, { desc }) => [desc(invoices.number)],
    });

    const formdata = {
        number: (latestInvoice?.number ? parseInt(latestInvoice.number) + 1 : 1).toString(),
        date: new Date().toISOString(),
        clientId,
        services: [{ title: '', amount: '1', price: '0' }],
    };

    const form = await superValidate(formdata, invoicesInsertSchema);

    return { form, clients, latestNumber: latestInvoice?.number };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, invoicesInsertSchema);
        console.log(form.data, JSON.stringify(form.errors));
        return { form };
    },
} satisfies Actions;
