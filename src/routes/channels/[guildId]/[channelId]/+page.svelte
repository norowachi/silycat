<script lang="ts">
	import Message from '$lib/components/app/Message.client.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { PageProps } from './$types';
	import io, { type Socket } from 'socket.io-client';
	import { writable } from 'svelte/store';
	import { WebSocketOP } from '$lib/interfaces/delta';
	import MessageBox from '$lib/components/app/MessageBox.client.svelte';
	import { afterNavigate, beforeNavigate } from '$app/navigation';

	let { data }: PageProps = $props();

	let app = $state<HTMLElement>();
	let messageContainer = $state<HTMLElement>();
	const messages = writable(data.messages);
	const socket = writable<Socket>();

	onMount(() => {
		if (messageContainer)
			messageContainer.scrollTo({
				top: messageContainer.scrollHeight,
				behavior: 'instant',
			});

		socket.set(
			io('https://api.noro.cc', {
				auth: {
					token: data.token,
				},
			}),
		);

		$socket.on('connect', () => {
			$socket.emit('join', [data.guild.id]);
		});

		$socket.on('ping', (callback) => {
			// ack ping
			callback($socket.id);
		});

		$socket.on('message', (message) => {
			if (message.op === WebSocketOP.MESSAGE_CREATE)
				messages.update((prev) =>
					// TODO: add a way to make messages show with gray text or so if they're still not sent
					(prev.find((m) => m.id === message.d.id) ? prev : [...prev, message.d]).sort(
						(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
					),
				);
		});

		new ResizeObserver(ChatLength).observe(document.getElementById('chat')!);
	});

	afterNavigate(() => {
		messages.set(data.messages);
		// TODO: create room joining for the new channel
		// and leaving the old one (missing in backend)
		// for now its not a big deal as we just join the whole guild's room
		// may not even be a problem as we want to keep getting messages from the whole guild
	});

	onDestroy(() => {
		$socket.disconnect();
	});

	// Auto-scroll
	messages.subscribe(async () => {
		if (messageContainer) {
			await new Promise((r) => setTimeout(r, 1));
			messageContainer.scrollTo({
				top: messageContainer.scrollHeight,
				behavior: 'instant',
			});
		}
	});

	function ChatLength(entries: ResizeObserverEntry[]) {
		const target = entries[0].target as HTMLTextAreaElement;
		if (!app) return;

		app.style.height = 'calc(100vh - 56px - ' + target.clientHeight + 'px)';

		if (messageContainer) {
			messageContainer.scrollTo({
				top: messageContainer.scrollHeight,
				behavior: 'instant',
			});
		}
		return;
	}
</script>

<main
	bind:this={app}
	class="flex flex-col w-full overflow-hidden"
	style="height: calc(100vh - 100px)"
>
	<section bind:this={messageContainer} class="overflow-y-auto snap-y snap-mandatory">
		<ul class="snap-end">
			{#each $messages as { id, content, embeds, author, createdAt }, i (id)}
				<il>
					<Message {id} {content} {embeds} {author} {createdAt} lastMessage={$messages[i - 1]} />
				</il>
			{/each}
			<il>
				<br />
			</il>
		</ul>
	</section>
</main>
<MessageBox guildId={data.guild.id} channelId={data.channel.id} />
