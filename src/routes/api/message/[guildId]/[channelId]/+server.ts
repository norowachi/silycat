import type { IMessage } from '$lib/interfaces/delta';
import { type RequestHandler, error, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, request, cookies, fetch }) => {
	const body: Partial<IMessage> = await request.json().catch(() => {});
	if (!body) return error(400, 'No body provided');

	const token = cookies.get('token');
	if (!token) return error(401, 'Unauthorized');

	const guildId = params.guildId;
	const channelId = params.channelId;

	if (!guildId || !channelId) return error(400, 'Invalid guild or channel ID');

	const result = await fetch(`https://api.noro.cc/v1/channels/${guildId}/${channelId}/messages`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			content: body.content,
			embeds: body.embeds,
		} as Partial<IMessage>),
	}).catch(() => {});

	if (!result || !result.ok)
		return error(result?.status || 500, result?.statusText || 'Internal Server Error');

	const data = await result.json().catch(() => {});

	if (!data) return error(500, 'Internal Server Error');

	return json({ ...data }, { status: 200 });
};

export const GET: RequestHandler = async ({ params, cookies, url }) => {
	const token = cookies.get('token');
	if (!token) return error(401, 'Unauthorized');

	const guildId = params.guildId;
	const channelId = params.channelId;

	if (!guildId || !channelId) return error(400, 'Invalid guild or channel ID');

	const page = url.searchParams.get('page');
	const around = url.searchParams.get('around');
	const before = url.searchParams.get('before');
	const after = url.searchParams.get('after');

	const result = await fetch(
		`https://api.noro.cc/v1/channels/${guildId}/${channelId}/messages?${page ? `page=${page}&` : ''}${around ? `around=${around}&` : ''}${before ? `before=${before}&` : ''}${after ? `after=${after}&` : ''}`,
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
			cache: 'no-store',
		},
	).catch(() => {});

	if (!result || !result.ok)
		return error(result?.status || 500, result?.statusText || 'Internal Server Error');

	const data = await result.json().catch(() => {});

	if (!data) return error(500, 'Internal Server Error');

	return json({ ...data }, { status: 200 });
};
