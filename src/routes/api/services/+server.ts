import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ilike, type InferSelectModel } from 'drizzle-orm';
import { servicesLib } from '$lib/db/schema';
import db from '$lib/db/client';

export const GET: RequestHandler = async ({ url }) => {
    const { searchParams } = url;
    const query = searchParams.get('query');
    if (!query) {
        throw error(400, 'Query string is reqired');
    }

    let suggested: InferSelectModel<typeof servicesLib>[] | undefined;
    try {
        suggested = await db
            .select()
            .from(servicesLib)
            .where(ilike(servicesLib.title, `%${query}%`))
            .limit(5);
        console.log(suggested);
    } catch (e) {
        console.error(e);
    }

    if (suggested) {
        return new Response(JSON.stringify(suggested));
    }

    throw error(500, 'Something went wrong');
};
