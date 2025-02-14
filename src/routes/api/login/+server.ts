import { type RequestHandler, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const FormData = await request.formData();
	const login = FormData.get('login')?.toString();
	const password = FormData.get('password')?.toString();
	let username = null;
	let handle = null;

	if (login?.toString().includes('@')) {
		handle = login;
	} else {
		username = login;
	}

	const auth = await fetch('https://api.noro.cc/auth/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, handle, password }),
	}).catch(() => {});

	const data = await auth?.json().catch(() => {});
	if (!data || !data.token) return json({ message: data.message }, { status: auth?.status || 500 });

	cookies.set('token', data.token, {
		// expires: new Date(Date.now() +  * 1000),
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
