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
	import { getMessages } from '$lib/api/message';

	let { data }: PageProps = $props();

	let app: HTMLElement;
	let messageContainer: HTMLElement;
	let loading = $state<boolean>(false);
	let messages = $state<IMessage[]>([]);
	/**
	 * messages current page
	 */
	let MessagePages = $state<number>(1);
	let MessageMaxPages = $state<boolean>(false);
	const socket = writable<Socket>();

	let itemId: string | null = null;

	onMount(async () => {
		// load messages
		if (!messages.length) {
			const result = await getMessages({
				guildId: data.guild.id,
				channelId: data.channel.id,
				page: MessagePages,
			});
			if (result) {
				messages = result.messages;
				MessagePages = result.currentPage;
				MessageMaxPages = result.pages === result.currentPage;
			}
		}

		// connect to the websocket if not connected
		if (!$socket || !$socket.connected)
			socket.set(
				io('wss://api.noro.cc', {
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
		// body resize observer
		new ResizeObserver(() => {
			if (
				messageContainer && // if user scrolled up 2x their viewport or more, don't scroll down
				messageContainer.scrollHeight - messageContainer.scrollTop < 3 * window.innerHeight
			)
				messageContainer.scrollTo({
					top: messageContainer.scrollHeight,
					behavior: 'instant',
				});
		}).observe(document.body);

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
		loading = false;
		setTimeout(() => {
			messageContainer.scrollTo({
				top: messageContainer.scrollHeight,
				behavior: 'instant',
			});
		}, 0);
		// if we're just entering the page, we don't need to do anything
		if (nav.type === 'enter') return;
		messages = data.messages?.messages || [];
		MessagePages = data.messages?.currentPage || 1;
		MessageMaxPages = data.messages?.pages === data.messages?.currentPage || false;
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
				// if user scrolled up 2x their viewport or more, don't scroll down
			} else if (
				messageContainer.scrollHeight - 3 * window.innerHeight <=
				messageContainer.scrollTop
			) {
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

	async function onContainerScroll() {
		if (
			messageContainer.scrollTop <= messageContainer.clientHeight &&
			messages.length >= 100 &&
			!loading &&
			!MessageMaxPages
		) {
			loading = true;
			// get next page
			const result = await getMessages({
				guildId: data.guild.id,
				channelId: data.channel.id,
				page: MessagePages + 1,
			});
			if (result?.messages?.length) {
				messages = [...result.messages, ...messages];
				MessagePages = result.currentPage;
				MessageMaxPages = result.pages === result.currentPage;
				// remove loader if no more pages
				if (MessageMaxPages) {
					messageContainer.onscroll = null;
					loading = false;
					return;
				}

				setTimeout(() => {
					loading = false;
					onContainerScroll();
				}, 1000);
			} else loading = false;
		}
	}
</script>

<main bind:this={app} class="flex flex-col-reverse w-full" style="height: calc(100dvh - 100px)">
	<section
		bind:this={messageContainer}
		onscroll={onContainerScroll}
		class="w-full overflow-y-auto snap-y snap-mandatory"
	>
		<ul class="snap-normal">
			{#if loading}
				<li class="flex justify-center items-center m-auto mt-2 w-64px">
					<svg
						aria-hidden="true"
						viewBox="0 0 100 101"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						class="w-32 text-[#ccc] animate-spin fill-[var(--other-background)]"
					>
						<path
							d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
							fill="currentColor"
						/>
						<path
							d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
							fill="currentFill"
						/>
					</svg>
				</li>
			{/if}
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
