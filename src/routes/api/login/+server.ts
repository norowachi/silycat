import { type RequestHandler, error, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
	const FormData = await request.formData().catch(() => {});
	if (!FormData) return error(400, 'No body provided');
	const login = FormData.get('login')?.toString();
	const password = FormData.get('password')?.toString();
	let username = null;
	let handle = null;

	if (login?.toString().includes('@')) {
		handle = login;
	} else {
		username = login;
	}

	if (!username && !handle) return error(400, 'Invalid login');
	if (!password) return error(400, 'No password provided');

	const auth = await fetch('https://api.noro.cc/auth/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, handle, password }),
	}).catch(() => {});

	const data = await auth?.json().catch(() => {});

	if (!data || !data.token)
		return error(auth?.status || 500, data.message || 'Internal Server Error');

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
