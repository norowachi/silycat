import type { IMessage } from '$lib/interfaces/delta';

export async function getMessages({
	guildId,
	channelId,
	page,
}: Pick<IMessage, 'guildId' | 'channelId'> & { page?: number }): Promise<
	{ currentPage: number; pages: number; messages: IMessage[] } | undefined
> {
	return await (
		await fetch(`/api/message/${guildId || '@me'}/${channelId}?page=${page || 1}`, {
			method: 'GET',
			cache: 'no-store',
		}).catch(console.error)
	)
		?.json()
		.catch(console.error);
}
