import type { IMessage } from '$lib/interfaces/delta';

export async function getMessages({
	guildId,
	channelId,
	page,
	around,
	before,
	after,
	fetch = window.fetch,
}: Pick<IMessage, 'guildId' | 'channelId'> & {
	page?: number;
	around?: string;
	before?: string;
	after?: string;
	fetch?: typeof window.fetch;
}): Promise<{ currentPage: number; pages: number; messages: IMessage[] } | undefined> {
	if (!page && !around && !before && !after) page = 1;
	return await (
		await fetch(
			`/api/message/${guildId || '@me'}/${channelId}?${page ? `page=${page}&` : ''}${around ? `around=${around}&` : ''}${before ? `before=${before}&` : ''}${after ? `after=${after}&` : ''}`,
			{
				method: 'GET',
				cache: 'no-store',
			},
		).catch(() => {})
	)
		?.json()
		.catch(() => {});
}
