import db from '$lib/db/client';
import { invoices } from '$lib/db/schema';
import { createInsertSchema } from 'drizzle-zod';
import { superValidate } from 'sveltekit-superforms/server';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    const schema = createInsertSchema(invoices);

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
        date: new Date().toLocaleDateString('ru-RU'),
    };

    const form = await superValidate(formdata, schema);

    return { form, clients, latestNumber: latestInvoice?.number };
}) satisfies PageServerLoad;
