import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');

	console.log(token);

	return {
		LoggedIn: !!token,
	};
};
