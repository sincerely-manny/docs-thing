import db from '$lib/db/client';
import { clients, invoices } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    const list = await db
        .select()
        .from(invoices)
        .orderBy(invoices.number)
        .leftJoin(clients, eq(invoices.clientId, clients.id));
    return { invoices: list.map(({ invoices, clients }) => ({ ...invoices, client: clients })) };
}) satisfies PageServerLoad;
