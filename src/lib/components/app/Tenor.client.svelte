<script lang="ts">
	import type {
		CATEGORY_OBJECT,
		CategoryResponse,
		GIF_OBJECT,
		SearchResponse,
	} from '$lib/interfaces/tenor';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let loader = $state<HTMLSpanElement>();
	const search = writable<{ query: string; next?: string }>();
	const gifs = writable<GIF_OBJECT[]>([]);
	const categories = writable<CATEGORY_OBJECT[]>([]);

	async function getTenorGifs(query: string, next?: string) {
		if ($gifs.length >= 100) return;
		let body = {
			query,
			next,
		};

		const res = await fetch('/api/tenor', {
			method: 'POST',
			body: JSON.stringify(body),
		});
		const data: SearchResponse = await res.json();
		const filteredResults = data.results.filter(
			({ id: newId }) => !$gifs.find(({ id: oldId }) => oldId === newId),
		);
		gifs.update((old) => ($search?.query === query ? [...old, ...filteredResults] : data.results));
		search.set({ query, next: data.next });
		return;
	}

	onMount(async () => {
		if (!($gifs?.length || 0) && !($categories?.length || 0)) {
			const res: CategoryResponse = await (await fetch('/api/tenor')).json();

			categories.set(res.tags);
		}
	});

	$effect(() => {
		if (loader)
			new IntersectionObserver(
				async (entries) => {
					if (entries[0].isIntersecting && entries[0].time > 1000) {
						if ($search.next) await getTenorGifs($search.query, $search.next);
					}
					return;
				},
				{
					rootMargin: '220px',
				},
			).observe(loader);
	});
</script>

<div class="flex flex-col">
	<input
		type="text"
		placeholder="Search for a gif"
		class="sticky w-full p-2 bg-gray-50 text-black rounded-lg dark:bg-gray-700"
		onkeydown={async (e) => {
			if (e.key === 'Enter') {
				await getTenorGifs(e.currentTarget.value);
			}
		}}
	/>
	<div class="top-4 bg-gray-7 overflow-y-scroll rounded-lg">
		<div class="flex flex-wrap justify-evenly w-md lg:w-xl gap-2">
			{#if !($gifs?.length || 0)}
				{#each $categories as category (category.name)}
					<div class="relative w-48% lg:w-32% h-128px cursor-pointer">
						<img src={category.image} alt={category.name} class="w-full h-full rounded-md" />
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
						aria-label="gif"
						src={gif.media_formats.tinygif.url}
						alt={gif.id}
						class="rounded-md cursor-pointer"
						style="width: {gif.media_formats.tinygif.dims[0]}; height: {gif.media_formats.tinygif
							.dims[1]};"
					/>
				{/each}
				<span bind:this={loader} id="gifs-end"></span>
			{/if}
		</div>
	</div>
</div>
