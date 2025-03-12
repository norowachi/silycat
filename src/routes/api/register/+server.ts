import { type RequestHandler, json, error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
	const FormData = await request.formData().catch(() => {});
	if (!FormData) return error(400, 'No body provided');
	const username = FormData.get('username')?.toString();
	const handle = FormData.get('email')?.toString();
	const password = FormData.get('password')?.toString();

	const auth = await fetch('https://api.noro.cc/auth/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, handle, password }),
	}).catch(() => {});

	const data = await auth?.json().catch(() => {});

	if (!data || !data.token)
		return error(auth?.status || 500, auth?.statusText || 'Internal Server Error');

	cookies.set('token', data.token, {
		// 7 days expiry
		expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		httpOnly: true,
		sameSite: 'strict',
		secure: true,
		path: '/',
	});

	return json(
		{ message: data.message, redirect: '/app' },
		{
			status: 200,
		},
	);
};
