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
				behavior: 'smooth',
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

		document.getElementById('chat')!.onkeydown = ChatLength;
		document.getElementById('chat')!.onpaste = ChatLength;
		document.getElementById('chat')!.oncut = ChatLength;
		document.getElementById('chat')!.oninput = ChatLength;

		function ChatLength(e: Event) {
			const target = e.currentTarget as HTMLTextAreaElement;
			const app = document.getElementById('app')!;

			app.style.height = 'calc(100vh - 20px - ' + target.clientHeight + 'px)';

			if (messageContainer)
				messageContainer.scrollTo({
					top: messageContainer.scrollHeight,
					behavior: 'instant',
				});
		}
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
</script>

<main id="app" class="flex flex-col w-full" style="height: calc(100vh - 60px)">
	<section bind:this={messageContainer} class="w-full overflow-y-auto snap-y snap-mandatory pb-3">
		<ul class="snap-start">
			{#each $messages as { id, content, embeds, author, createdAt } (id)}
				<il>
					<Message {id} {content} {embeds} {author} {createdAt} />
				</il>
			{/each}
		</ul>
	</section>
	<div class="w-full fixed bottom-2.5">
		<MessageBox guildId={data.guild.id} channelId={data.channel.id} />
	</div>
</main>
