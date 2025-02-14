import type { IMessage } from '$lib/interfaces';
import { type RequestHandler, error, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, request, cookies }) => {
	const body: Partial<IMessage> = await request.json();
	const token = cookies.get('token');

	if (!token) return error(401, 'Unauthorized');

	const guildId = params.guildId;
	const channelId = params.channelId;

	if (!guildId || !channelId) return error(400, 'Bad Request');

	const result = await fetch(`https://api.noro.cc/channels/${guildId}/${channelId}/messages`, {
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

	if (!result) return error(500, 'Internal Server Error');

	const data = await result.json().catch(() => {});

	if (!data) return error(500, 'Internal Server Error');

	return json({ message: 'Message sent', data }, { status: 200 });
};
