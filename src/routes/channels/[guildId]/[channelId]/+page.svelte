<script lang="ts">
	import Message from '$lib/components/app/Message.client.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { PageProps } from './$types';
	import io, { type Socket } from 'socket.io-client';
	import { writable } from 'svelte/store';
	import { WebSocketOP, type IMessage } from '$lib/interfaces/delta';
	import MessageBox from '$lib/components/app/MessageBox.client.svelte';
	import { afterNavigate } from '$app/navigation';

	let { data }: PageProps = $props();

	let app: HTMLElement;
	let messageContainer: HTMLElement;
	let messages = $state<IMessage[]>([]);
	const socket = writable<Socket>();

	onMount(() => {
		if (!messages.length)
			fetch(`/api/message/${data.guild.id}/${data.channel.id}`)
				.then(async (res) => {
					const data = await res.json();
					messages = data.messages;
				})
				.catch(console.error);

		socket.set(
			io('https://api.noro.cc', {
				auth: {
					token: data.token,
				},
			}),
		);

		$socket.on('connect', () => {
			console.log('[WS] Connected to the server');
			$socket.emit('join', [data.guild.id]);
		});

		$socket.on('ping', (callback) => {
			// ack ping
			callback($socket.id);
		});

		$socket.on('message', (message) => {
			if (message.op === WebSocketOP.MESSAGE_CREATE) {
				const md: IMessage = message.d;
				if (md.channelId !== data.channel.id) return;
				// TODO: add a way to make messages show with gray text or so if they're still not sent
				messages = (
					messages?.find((msg) => msg.id === md.id) ? messages : [...(messages || []), md]
				)?.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
			}
		});

		const chat = document.getElementById('chat')!;
		new ResizeObserver(ChatLength).observe(chat);
		document.onkeydown = (e) => {
			const target = e.target as HTMLElement;
			if ('value' in target) return;
			chat.focus();
		};
	});

	afterNavigate(() => {
		if (messages.length) messages = data.messages;
		// TODO: create room joining for the new channel
		// and leaving the old one (missing in backend)
		// for now its not a big deal as we just join the whole guild's room
		// may not even be a problem as we want to keep getting messages from the whole guild
	});

	onDestroy(() => {
		console.log('[WS] Disconnecting from the server');
		$socket.disconnect();
	});

	// Auto-scroll
	$effect.pre(() => {
		messages;
		if (messageContainer) {
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
	class="flex flex-col-reverse w-full overflow-hidden"
	style="height: calc(100vh - 100px)"
>
	<section bind:this={messageContainer} class="w-full overflow-y-auto snap-y snap-mandatory">
		<ul class="snap-end self-end">
			{#each messages as { id, content, embeds, author, createdAt }, i (id)}
				<il>
					<Message {id} {content} {embeds} {author} {createdAt} lastMessage={messages[i - 1]} />
				</il>
			{/each}
			<il>
				<br />
			</il>
		</ul>
	</section>
</main>
<MessageBox guildId={data.guild.id} channelId={data.channel.id} />
