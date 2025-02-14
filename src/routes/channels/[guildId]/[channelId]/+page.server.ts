import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { IChannel, IGuild, IMessage, IUser } from '$lib/interfaces';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const token = cookies.get('token');

	if (!token) return error(401, 'Unauthorized');

	const user = (await (
		await fetch('https://api.noro.cc/v1/users/@me', {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).catch(console.error)
	)
		?.json()
		.catch(console.error)) as IUser;
	if (!user) return error(401, 'Unauthorized');

	const { guildId, channelId } = params;

	// Fetch guild
	const guild = (await (
		await fetch(`https://api.noro.cc/v1/guilds/${guildId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).catch(console.error)
	)
		?.json()
		.catch(console.error)) as IGuild;

	// send 404 if the guild is not found
	if (!guild) return error(404, 'Guild not found');

	// Fetch channels
	const channels: IChannel[] = (
		await (
			await fetch(`https://api.noro.cc/v1/guilds/${guildId}/channels`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}).catch(console.error)
		)
			?.json()
			.catch(console.error)
	)?.channels;

	// Filter out channels that the user is not a member of
	const allowedChannels = channels.filter((channel) => channel.members.includes(user.id));
	// Find the target channel
	const TargetChannel = allowedChannels.find((channel) => channel.id === channelId);

	// send 404 if the channel is not found
	if (!TargetChannel) return error(404, 'Channel not found');

	// Fetch messages
	const messages: IMessage[] = (
		await (
			await fetch(`https://api.noro.cc/v1/channels/${guildId}/${channelId}/messages`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}).catch(console.error)
		)
			?.json()
			.catch(console.error)
	)?.messages;

	if (!messages) return error(500, 'Internal Server Error');

	// TODO: use the guild and channel fetching in the layout
	return {
		user,
		guild,
		channels: allowedChannels,
		channel: TargetChannel,
		messages,
		token,
	};
};
