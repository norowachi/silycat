import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	return redirect(302, `/channels/${params.guildId}/${params.channelId}#${params.messageId}`);
};
