<script lang="ts">
	import type { IMessage } from '$lib/interfaces';

	let {
		id,
		content,
		embeds,
		author,
		createdAt,
	}: Pick<IMessage, 'id' | 'content' | 'embeds' | 'author' | 'createdAt'> = $props();
	const date = new Date(createdAt);
</script>

<div class="w-full p-2">
	<div class="w-full inline-flex relative items-center m-auto">
		<img
			src={author.avatar || 'https://api.noro.cc/images/delta-0.png'}
			alt={author.username}
			height="40"
			width="40"
			class="rounded-full"
		/>
		<h3 class="ml-2">
			<span class="text-lg">{author.username}</span>
			<span class="text-gray-500 text-xs">
				{date.toDateString()}
				{date.toLocaleTimeString(undefined, { timeStyle: 'short' })}
			</span>
		</h3>
	</div>
	<div class="text-wrap break-words w-full p-2">
		{content}
	</div>

	{#if embeds}
		<div class="message__embeds">
			{#each embeds as embed}
				<div class="message__embed">
					{embed}
				</div>
			{/each}
		</div>
	{/if}
</div>
