<script lang="ts">
	import type { IMessage } from '$lib/interfaces/delta';
	import { error } from '@sveltejs/kit';

	let {
		id,
		content,
		embeds,
		author,
		createdAt,
		lastMessage,
	}: Pick<IMessage, 'id' | 'author' | 'createdAt'> &
		Partial<Pick<IMessage, 'content' | 'embeds'>> & {
			lastMessage?: IMessage;
		} = $props();
	const date = new Date(createdAt);
	// if same author and there is a time difference of 10 minutes
	const GroupUp =
		lastMessage?.author.id === author.id &&
		date.getTime() - new Date(lastMessage.createdAt).getTime() < 600000;
	if (!content && (embeds?.length || 0) === 0)
		error(400, 'Message must have either content or embeds');
</script>

{#if !GroupUp}
	<div class="pt-3"></div>
{/if}
<div class="w-full px-2 rounded-md transition-colors duration-100 ease-in-out hover:bg-pink-300">
	{#if !GroupUp}
		<div class="w-full inline-flex items-center mx-auto pt-1">
			<img
				src={author.avatar || 'https://api.noro.cc/images/delta-0.png'}
				alt={author.username}
				height="40"
				width="40"
				class="rounded-full"
				loading="lazy"
			/>
			<h3 class="ml-2">
				<span class="text-lg cursor-pointer hover:underline">{author.username}</span>
				<span class="text-gray-500 text-xs pointer-events-none">
					{date.toDateString()}
					{date.toLocaleTimeString(undefined, { timeStyle: 'short' })}
				</span>
			</h3>
		</div>
	{/if}

	{#if content}
		<div class="text-wrap break-words px-2 whitespace-pre-line">
			{content.replace(/^(\n|\s)+/, '')}
		</div>
	{/if}

	{#if embeds && embeds.length > 0}
		<div class="pb-2" style={GroupUp ? 'padding-top: 8px;' : ''}>
			{#each embeds as embed}
				{#if embed.type === 'image'}
					<img
						src={embed.image.url}
						alt={embed.image.url}
						width={embed.image.width}
						height={embed.image.height}
						class="rounded-md max-w-sm"
						loading="lazy"
					/>
				{/if}
			{/each}
		</div>
	{/if}
</div>
