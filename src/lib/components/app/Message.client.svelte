<script lang="ts">
	import type { IMessage } from '$lib/interfaces/delta';

	let {
		id,
		content,
		embeds,
		author,
		createdAt,
		lastMessage,
	}: Pick<IMessage, 'id' | 'content' | 'embeds' | 'author' | 'createdAt'> & {
		lastMessage?: IMessage;
	} = $props();
	const date = new Date(createdAt);
	// if same author and there is a time difference of 10 minutes
	const GroupUp =
		lastMessage?.author.id === author.id &&
		date.getTime() - new Date(lastMessage.createdAt).getTime() < 600000;

	function formatContent() {
		const isTenorGif = /^https?:\/\/media\.tenor\.com\/.*$/.test(content);
		if (isTenorGif) {
			const img = document.createElement('img');
			img.src = content.replace(/<|>/, '');
			// img.alt = content.split(/\//g)[5];
			console.log(content.split(/\//g)[5]);
			return img.innerHTML;
		}
		return content.replace(/^(\n|\s)+/, '');
	}
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
	<div class="text-wrap break-words px-2 whitespace-pre-line">
		{#if /^<https?:\/\/media\.tenor\.com\/.*>$/.test(content)}
			<img
				src={content.replace(/<|>/, '')}
				alt="img"
				class="rounded-md pb-2"
				style={GroupUp ? 'padding-top: 8px;' : ''}
			/>
		{:else}
			{content.replace(/^(\n|\s)+/, '')}
		{/if}
	</div>

	{#if embeds.length > 0}
		<div class="message__embeds">
			{#each embeds as embed}
				<div class="message__embed">
					{embed}
				</div>
			{/each}
		</div>
	{/if}
</div>
