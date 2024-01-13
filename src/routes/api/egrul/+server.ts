import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DADATA_TOKEN } from '$env/static/private';

export const GET: RequestHandler = async ({ url }) => {
    const { searchParams } = url;
    const query = searchParams.get('query');
    if (!query) {
        throw error(400, 'Query string is reqired');
    }

    const dadataRes = await fetch(
        'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party',
        {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Token ' + DADATA_TOKEN,
            },
            body: JSON.stringify({ query: query, count: 5 }),
        },
    );

    return new Response(await dadataRes.text());
};
