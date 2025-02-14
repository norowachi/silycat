<script lang="ts">
	import Message from '$lib/components/app/Message.client.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { PageProps } from './$types';
	import io, { Socket } from 'socket.io-client';
	import { writable } from 'svelte/store';
	import { WebSocketOP } from '$lib/interfaces';
	import MessageBox from '$lib/components/app/MessageBox.client.svelte';

	let { data }: PageProps = $props();

	const messages = writable(data.messages);

	const socket = writable<Socket>();

	let messageContainer = $state<HTMLElement>();

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
			console.log('connected');
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

	onDestroy(() => {
		$socket.disconnect();
	});

	// Auto-scroll
	messages.subscribe(async () => {
		console.log('scrolling');
		if (messageContainer) {
			await new Promise((r) => setTimeout(r, 1));
			messageContainer.scrollTo({
				top: messageContainer.scrollHeight,
				behavior: 'instant',
			});
		}
	});

	function ChatLength(entries: ResizeObserverEntry[]) {
		console.log((entries[0].target as HTMLTextAreaElement).style);
		const target = entries[0].target as HTMLTextAreaElement;
		const app = document.getElementById('app')!;

		app.style.height = 'calc(100vh - 20px - ' + target.clientHeight + 'px)';

		if (messageContainer) {
			messageContainer.scrollTo({
				top: messageContainer.scrollHeight,
				behavior: 'instant',
			});
		}
	}
</script>

<main id="app" class="flex flex-col w-full overflow-hidden" style="height: calc(100vh - 60px)">
	<section bind:this={messageContainer} class="overflow-y-auto snap-y snap-mandatory pb-1.5">
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
<div class="w-full sticky bottom-1">
	<MessageBox guildId={data.guild.id} channelId={data.channel.id} />
</div>
