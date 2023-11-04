import { createInsertSchema } from 'drizzle-zod';
import type { PageServerLoad } from './$types';
import { clients } from '$lib/db/schema';
import { superValidate } from 'sveltekit-superforms/server';

export const load = (async () => {
    const schema = createInsertSchema(clients);
    const form = await superValidate(schema);
    return { form };
}) satisfies PageServerLoad;

export const actions = {};
