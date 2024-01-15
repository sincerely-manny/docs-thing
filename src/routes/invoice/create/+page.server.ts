import db from '$lib/db/client';
import { invoices, invoicesInsertSchema, services, servicesLib } from '$lib/db/schema';
import { fail, type Actions } from '@sveltejs/kit';
import { eq, max } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms/server';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
    const clientId = url.searchParams.get('clientId') || '';
    const clients = await db.query.clients.findMany({
        orderBy: (clients, { asc }) => [asc(clients.name)],
    });

    const currentYear = new Date().getFullYear;

    // const latestInvoice = await db.query.invoices.findFirst({
    //     // where: {
    //     //     date: {
    //     //         gte: `${currentYear}-01-01`,
    //     //         lte: `${currentYear}-12-31`,
    //     //     },
    //     // },
    //     orderBy: (invoices, { desc }) => [desc(invoices.date)],
    // });
    const m = await db.select({ value: max(invoices.number) }).from(invoices);
    const maxNumber = m[0]?.value || '0';

    const formdata = {
        number: (parseInt(maxNumber) + 1).toString(),
        date: new Date().toISOString(),
        clientId,
        services: [{ title: '', amount: '1', price: '0' }],
    };

    const form = await superValidate(formdata, invoicesInsertSchema);

    return { form, clients };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, invoicesInsertSchema);
        console.log(form.data, JSON.stringify(form.errors));
        if (!form.valid) {
            return fail(400, { form });
        }
        const { number, date, clientId, services: formServices } = form.data;

        // inserting invoice
        const invoice = await db
            .insert(invoices)
            .values({
                number,
                date,
                clientId,
            })
            .returning();
        for (const service of formServices) {
            const { title, amount, price } = service;

            // inserting services
            await db.insert(services).values({
                invoiceId: invoice[0].id,
                title,
                amount: parseInt(amount),
                price: price,
            });

            // inserting servicesLib
            const existing = await db.query.servicesLib.findFirst({
                where: eq(servicesLib.title, service.title),
            });
            if (!existing) {
                await db.insert(servicesLib).values({
                    title,
                    price,
                });
            }
        }

        return { form };
    },
} satisfies Actions;
