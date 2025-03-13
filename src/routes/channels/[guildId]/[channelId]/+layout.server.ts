import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { IGuild, IUser } from '$lib/interfaces/delta';
import { getMessages } from '$lib/api/message';

export const load: LayoutServerLoad = async ({ params, cookies, fetch }) => {
	const token = cookies.get('token');

	if (!token) return redirect(303, '/');

	const user = (await (
		await fetch('https://api.noro.cc/v1/users/@me', {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).catch(() => {})
	)
		?.json()
		.catch(() => {})) as IUser;
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

	// Filter out channels that the user is not a member of
	const allowedChannels = guild.channels.filter((channel) => channel.members.includes(user.id));
	// Find the target channel
	const TargetChannel = allowedChannels.find((channel) => channel.id === channelId);

	// send 404 if the channel is not found
	if (!TargetChannel) return error(404, 'Channel not found');

	// Fetch messages
	let messages = (await getMessages({ guildId, channelId, fetch }))?.messages;

	messages ||= [];

	// if (!messages?.length) return error(404, "Cloudn't fetch messages");

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
