<script lang="ts">
	import Message from '$lib/components/app/Message.client.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { PageProps } from './$types';
	import io, { type Socket } from 'socket.io-client';
	import { writable } from 'svelte/store';
	import { WebSocketOP, type IMessage } from '$lib/interfaces/delta';
	import MessageBox from '$lib/components/app/MessageBox.client.svelte';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { page } from '$app/state';

	let { data }: PageProps = $props();

	let app: HTMLElement;
	let messageContainer: HTMLElement;
	let messages = $state<IMessage[]>([]);
	const socket = writable<Socket>();

	let itemId: string | null = null;

	onMount(async () => {
		// load messages
		if (!messages.length)
			messages = (
				await (
					await fetch(`/api/message/${data.guild.id}/${data.channel.id}`, {
						method: 'GET',
						cache: 'no-store',
					}).catch(console.error)
				)
					?.json()
					.catch(console.error)
			).messages;

		// connect to the websocket if not connected
		if (!$socket)
			socket.set(
				io('https://api.noro.cc', {
					auth: {
						token: data.token,
					},
				}),
			);

		// register events if not registered
		if ($socket && !$socket.hasListeners('message')) {
			// on connection
			$socket.on('connect', () => {
				console.log('[WS] Connected to the server');
				$socket.emit(
					'join',
					data.channels.map((c) => c.id),
				);
			});

			// heartbeat/ping
			$socket.on('ping', (callback) => {
				// ack ping
				if ($socket.disconnected) callback(null);
				else callback($socket.id);
			});

			// on new messages add to the $messages store
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

			// on mention send a notification
			$socket.on('mention', async ({ author, content, guildId, channelId }: IMessage) => {
				// get service worker
				const sw = await navigator.serviceWorker.getRegistration();
				// show notification if service worker is available
				if (sw)
					sw.showNotification(author.username, {
						body: content.replace(/<@\w+>/g, (match) => match.slice(1, -1)).trim(),
						icon: author.avatar || undefined,
						data: {
							guildId,
							channelId,
						},
						tag: 'mention',
					});
			});
		}

		// observe chatbox for resizing
		const chat = document.getElementById('chat')!;
		new ResizeObserver(ChatLength).observe(chat);
		// on keydown focus chatbox
		document.onkeydown = (e) => {
			if ((e.ctrlKey && e.key !== 'v') || e.altKey) return;
			const target = e.target as HTMLElement;
			if ('value' in target) return;
			chat.focus();
		};
	});

	// on page url change or so
	afterNavigate((nav) => {
		// if we're just entering the page, we don't need to do anything
		if (nav.type === 'enter') return;
		messages = data.messages;
		// TODO: create room joining for the new channel
		// and leaving the old one (missing in backend)
		// for now it's not a big deal as we just join the whole guild's room
	});

	// on disconnect, i think
	onDestroy(() => {
		console.log('[WS] Disconnecting from the server');
		$socket?.disconnect();
	});

	// Auto-scroll on new messages
	$effect(() => {
		// TODO: add check if the user is scrolled up
		// and if so, don't scroll down
		messages;
		if (messageContainer) {
			// get message id from url fragment
			itemId = page.url.hash?.replace('#', '');
			// TODO: add a way to load around a message not from the recents
			if (itemId) {
				// if item exists scroll to it
				const element = document.getElementById(itemId!);
				if (!element) return;
				setTimeout(() => {
					element.scrollIntoView({ behavior: 'smooth', block: 'center' });
					element.style.animation = 'color-pulse 2s linear';
				}, 100);
				// remove fragment after scrolling
				replaceState(window.location.pathname, page.state);
			} else {
				messageContainer.scrollTo({
					top: messageContainer.scrollHeight,
					behavior: 'instant',
				});
			}
		}
	});

	// resizing function
	function ChatLength(entries: ResizeObserverEntry[]) {
		const target = entries[0].target as HTMLTextAreaElement;
		if (!app) return;

		app.style.height = 'calc(100dvh - 56px - ' + target.clientHeight + 'px)';

		if (messageContainer) {
			messageContainer.scrollTo({
				top: messageContainer.scrollHeight,
				behavior: 'instant',
			});
		}
		return;
	}
</script>

<main bind:this={app} class="flex flex-col-reverse w-full" style="height: calc(100dvh - 100px)">
	<section bind:this={messageContainer} class="w-full overflow-y-auto snap-y snap-mandatory">
		<ul class="snap-end">
			{#each messages as { id, content, embeds, author, createdAt, mentions }, i (id)}
				<li class="mb-1px {i === messages.length - 1 ? 'pb-5' : ''}">
					<Message
						{id}
						{content}
						{embeds}
						{author}
						{createdAt}
						{mentions}
						lastMessage={messages[i - 1]}
					/>
				</li>
			{/each}
		</ul>
	</section>
</main>
<MessageBox guildId={data.guild.id} channelId={data.channel.id} />
