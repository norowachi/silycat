<script lang="ts">
	import type { IEmbed } from '$lib/interfaces/delta';
	import type {
		CATEGORY_OBJECT,
		CategoryResponse,
		GIF_OBJECT,
		SearchResponse,
	} from '$lib/interfaces/tenor';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let { guildId, channelId } = $props();

	let loader = $state<HTMLSpanElement>();
	let container = writable<HTMLDivElement>();
	const query = writable<string | undefined>();
	const next = writable<string | undefined>();
	const gifs = writable<GIF_OBJECT[]>([]);
	const categories = writable<CATEGORY_OBJECT[]>([]);

	async function getTenorGifs(input_next?: string) {
		if ($gifs.length >= 100) return;
		let body = {
			query: $query,
			next: input_next,
		};

		const res = await fetch('/api/tenor', {
			method: 'POST',
			body: JSON.stringify(body),
		});
		const data: SearchResponse = await res.json();
		let filteredResults: GIF_OBJECT[] = [];
		if (input_next)
			filteredResults = data.results.filter(
				({ id: newId }) => !$gifs.find(({ id: oldId }) => oldId === newId),
			);
		console.log($query, input_next, data.results, $gifs, $next);
		gifs.update((old) => (input_next ? [...old, ...filteredResults] : data.results));
		next.set(data.next);
		return;
	}

	async function OnClickSendGifEmbed({
		url,
		width,
		height,
	}: {
		url: string;
		width: number;
		height: number;
	}) {
		const embed: Partial<IEmbed> = {
			type: 'image',
			image: {
				url,
				width,
				height,
			},
		};

		await fetch(`/api/message/${guildId}/${channelId}`, {
			method: 'POST',
			body: JSON.stringify({
				embeds: [embed],
			}),
		});

		return;
	}

	onMount(() => {
		query.subscribe(async (value) => {
			// timeout for the user to finish typing
			await new Promise((r) => setTimeout(r, 1200));
			console.log(value, $query);
			// if the value is the same as the current query
			if (value && value === $query) {
				// resets the gifs to show the skeleton
				gifs.set([]);
				await getTenorGifs();
			}
			return;
		});

		container.subscribe(() => {
			if (
				$container?.parentElement?.style.display !== 'none' &&
				!$gifs?.length &&
				!$categories?.length
			) {
				fetch('/api/tenor')
					.then((res) => res.json().then((data: CategoryResponse) => categories.set(data.tags)))
					.catch(console.error);
			}
		});

		document.onclick = (e) => {
			const tab = document.getElementById('gifs-tab') as HTMLDivElement;
			if (!tab) return;
			const target = e.target as HTMLElement;
			if (target.id === 'gif' && target.tagName === 'IMG') {
				const img = target as HTMLImageElement;
				const gif = $gifs.find(({ media_formats }) => media_formats.tinygif.url === img.src);
				if (!gif) return;
				OnClickSendGifEmbed({
					url: gif.media_formats.gif.url,
					width: gif.media_formats.gif.dims[0] ?? 0,
					height: gif.media_formats.gif.dims[1] ?? 0,
				});
				tab.style.display = 'none';
				query.set(undefined);
				next.set(undefined);
				return;
			}
			// ignore the attach button, which is the caller
			if ([target.ariaLabel, document.activeElement?.ariaLabel].includes('Attach')) return;
			// if the click is within the tab
			if (tab.contains(target)) return;

			if (tab.style.display !== 'none') {
				gifs.set([]);
				query.set(undefined);
				next.set(undefined);
				tab.style.display = 'none';
			}
		};
	});

	$effect(() => {
		if (loader)
			new IntersectionObserver(
				async (entries) => {
					if (entries[0].isIntersecting && entries[0].time > 1000) {
						if ($next) await getTenorGifs($next);
					}
					return;
				},
				{
					rootMargin: '220px',
				},
			).observe(loader);
	});
</script>

<div class="flex flex-col overflow-hidden w-full h-full">
	<input
		type="text"
		placeholder="Search for a gif"
		class="sticky w-full border-3 border-b-0 border-gray-7 p-2 text-white placeholder-gray-8 rounded-lg rounded-b-0 focus:outline-none bg-gradient-to-b from-white to-gray-7 focus:from-cyan focus:to-gray-7"
		bind:value={$query}
		onkeydown={async (e) => {
			if (!e.repeat && e.key === 'Enter') {
				await getTenorGifs();
			}
		}}
	/>
	<div
		class="top-4 bg-gray-7 overflow-y-scroll rounded-lg rounded-t-0 rounded-b-0 h-100vh"
		bind:this={$container}
	>
		<div class="grid grid-auto-rows-auto cols-2 w-md lg:w-xl p-1 gap-1 lg:p-2 lg:gap-2">
			{#if $query && !$gifs?.length}
				<!-- skeleton -->
				{#each Array.from({ length: 10 }), i (i)}
					<div class="w-full h-128px lg:h-[calc(128px*1.3)] bg-gray-8 rounded-md animate-pulse"></div>
				{/each}
			{:else if !$gifs?.length}
				{#each $categories as category (category.name)}
					<div class="relative w-full h-128px lg:h-[calc(128px*1.3)] cursor-pointer">
						<img
							src={category.image}
							alt={category.name}
							class="w-full h-full rounded-md"
							loading="lazy"
						/>
						<div
							class="w-full absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xl font-bold rounded-md"
						>
							{category.name}
						</div>
					</div>
				{/each}
			{:else}
				{#each $gifs as gif (gif.id)}
					<img
						id="gif"
						src={gif.media_formats.tinygif.url}
						alt={gif.id}
						class="w-full rounded-md cursor-pointer"
						loading="lazy"
					/>
				{/each}
				<span bind:this={loader} id="gifs-end"></span>
			{/if}
		</div>
	</div>
</div>
