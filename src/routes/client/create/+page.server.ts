import db from '$lib/db/client';
import { clients, clientsInsertSchema } from '$lib/db/schema';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { InferModel, InferSelectModel } from 'drizzle-orm';
import type { PostgresError } from 'postgres';
import { setError, superValidate } from 'sveltekit-superforms/server';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    const form = await superValidate(clientsInsertSchema);
    return { form };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request, url }) => {
        const form = await superValidate(request, clientsInsertSchema);

        if (!form.valid) {
            return fail(400, { form });
        }
        // const { type, inn, ogrn, name, address, email } = form.data;
        let client: InferSelectModel<typeof clients>;
        try {
            client = (
                await db
                    .insert(clients)
                    .values({ ...form.data })
                    .returning()
            )[0];
        } catch (e) {
            const errorMessage = (e as PostgresError)?.detail;
            return setError(form, '', errorMessage || 'Unknown DB error', { status: 500 });
        }

        const redirectPath = `${url.searchParams.get('ref')}?clientId=${client.id}` || '';
        throw redirect(303, redirectPath);
    },
} satisfies Actions;