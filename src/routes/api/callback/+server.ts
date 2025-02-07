import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from '$env/static/private';
import { encryptToken } from '$lib';
import { type RequestHandler, json, redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, cookies }) => {
	const url = new URL(request.url);
	const callback = decodeURIComponent(url.searchParams.get('state') || '/');
	const code = url.searchParams.get('code');

	if (!code) return redirect(302, '/api/login');

	const result = await fetch('https://discord.com/api/v10/oauth2/token', {
		method: 'POST',
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: `${url.origin}/api/callback`,
		}),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${btoa(`${DISCORD_CLIENT_ID}:${DISCORD_CLIENT_SECRET}`)}`,
		},
	}).catch(console.error);

	if (!result) return redirect(302, '/api/login');

	const data = await result.json();

	if (!data.access_token) return redirect(302, '/api/login');

	const cookieOptions = {
		expires: new Date(Date.now() + data.expires_in * 1000),
		httpOnly: false,
		sameSite: 'strict' as const,
		secure: true,
		path: '/',
	};
	cookies.set('token', encryptToken(data.access_token), cookieOptions);

	const user = await fetch('https://discord.com/api/v10/users/@me', {
		headers: {
			Authorization: `Bearer ${data.access_token}`,
		},
	})
		.then((res) => res.json())
		.catch(console.error);

	if (!user)
		return json(
			{
				message: 'Unauthorized',
			},
			{ status: 401 },
		);

	cookies.set('discord-id', user.id, cookieOptions);
	cookies.set('discord-username', user.username, cookieOptions);
	cookies.set('discord-avatar', user.avatar, cookieOptions);

	return redirect(302, callback || '/');
};
