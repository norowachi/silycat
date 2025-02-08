import { type RequestHandler, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const FormData = await request.formData();
	const username = FormData.get('username')?.toString();
	const handle = FormData.get('email')?.toString();
	const password = FormData.get('password')?.toString();

	const auth = await fetch('https://api.noro.cc/auth/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, handle, password }),
	});

	const data = await auth.json();

	if (!data.token) return json({ message: data.message }, { status: auth.status });

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
