import { type RequestHandler, json, redirect } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const data = await request.formData();
	const login = data.get('login')?.toString();
	const password = data.get('password')?.toString();
	let username = null;
	let handle = null;

	if (login?.toString().includes('@')) {
		handle = login;
	} else {
		username = login;
	}

	console.log(request.headers, username, handle, password);

	const auth = await fetch('https://api.noro.cc/auth/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, handle, password }),
	});
	const { token } = await auth.json();
	if (!token) return redirect(302, '/');

	cookies.set('token', token, {
		// expires: new Date(Date.now() +  * 1000),
		httpOnly: true,
		sameSite: 'strict',
		secure: true,
		path: '/',
	});

	return json(
		{ message: 'Logged in' },
		{
			status: 200,
		},
	);
};
