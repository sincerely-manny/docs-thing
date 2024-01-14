import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    const { id } = params;
    return { id };
}) satisfies PageServerLoad;
