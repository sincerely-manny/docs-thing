import type { InferSelectModel } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { clients } from '$lib/db/schema';
import db from '$lib/db/client';

export const load = (async () => {
    let clientsList: InferSelectModel<typeof clients>[] = [];
    try {
        clientsList = await db.select().from(clients).orderBy(clients.name);
    } catch (e) {
        console.log(e);
    }
    return { clientsList };
}) satisfies PageServerLoad;
