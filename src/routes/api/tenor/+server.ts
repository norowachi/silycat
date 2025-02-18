import { TENOR_API_KEY } from '$env/static/private';
import type { CategoryResponse, SearchResponse } from '$lib/interfaces/tenor';
import { type RequestHandler, error, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => {});
	if (!body) return json({ message: 'No body provided' }, { status: 400 });
	const path = body.path;

	if (path) {
		const response = await fetch(`https://tenor.googleapis.com${path}&key=${TENOR_API_KEY}`).catch(
			() => {},
		);

		if (!response || !response.ok) return error(response?.status || 500, 'Tenor API request failed');

		const data = await response.json().catch(() => {});

		if (!data) return error(response.status || 500, 'Tenor API request failed');

		return json(
			{ ...data },
			{
				status: 200,
			},
		);
	}

	// get query and next from request body
	const query = body.query;
	const next = body.next ? `&pos=${body.next}` : '';

	if (!query) return json({ message: 'No query provided' }, { status: 400 });

	// call tenor api
	const response = await fetch(
		`https://tenor.googleapis.com/v2/search?q=${query}&key=${TENOR_API_KEY}&media_filter=tinygif,gif&limit=20` +
			next,
	).catch(() => {});

	if (!response || !response.ok) return error(response?.status || 500, 'Tenor API request failed');

	// return response
	const data: SearchResponse = await response.json().catch(() => {});

	if (!data) return error(response.status, 'Tenor API request failed');

	return json(
		{ ...data },
		{
			status: 200,
		},
	);
};

export const GET: RequestHandler = async () => {
	// call tenor api
	const response = await fetch(
		`https://tenor.googleapis.com/v2/categories?type=featured&key=${TENOR_API_KEY}`,
	).catch(() => {});

	if (!response || !response.ok)
		return json({ message: 'Tenor API request failed' }, { status: response?.status || 500 });

	// return response
	const data: CategoryResponse = await response.json();

	if (!data) return json({ message: 'Tenor API request failed' }, { status: 500 });

	return json(
		{ ...data },
		{
			status: 200,
		},
	);
};
