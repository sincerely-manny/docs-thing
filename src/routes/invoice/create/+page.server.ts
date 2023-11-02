import { createInsertSchema } from 'drizzle-zod';
import type { PageServerLoad } from './$types';
import { invoices } from '$lib/db/schema';
import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';

export const load = (async () => {
    // const schema = createInsertSchema(invoices);
    const schema = z.object({
        name: z.string().default('Hello world!'),
        email: z.string().email(),
    });

    const form = await superValidate(schema);
    return { form };
}) satisfies PageServerLoad;
