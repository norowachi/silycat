import { DISCORD_CLIENT_ID } from '$env/static/private';
import { type RequestHandler, redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	const url = new URL(request.url);
	// state
	const callback = encodeURIComponent(url.searchParams.get('state') || '/');
	const redirect_uri = encodeURIComponent(`${url.origin}/api/callback`);
	const scopes = ['identify'].join('%20');
	const authLink = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirect_uri}&response_type=code&scope=${scopes}&state=${callback}&prompt=none`;
	return redirect(302, authLink);
};
