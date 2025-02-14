import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) redirect(303, '/');

	return redirect(302, '/channels/g0/c0');
};
