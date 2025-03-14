import type { IMessage } from '$lib/interfaces/delta';

export async function getMessages({
	guildId,
	channelId,
	page,
	fetch = window.fetch,
}: Pick<IMessage, 'guildId' | 'channelId'> & {
	page?: number;
	fetch?: typeof window.fetch;
}): Promise<{ currentPage: number; pages: number; messages: IMessage[] } | undefined> {
	return await (
		await fetch(`/api/message/${guildId || '@me'}/${channelId}?page=${page || 1}`, {
			method: 'GET',
			cache: 'no-store',
		}).catch(() => {})
	)
		?.json()
		.catch(() => {});
}
