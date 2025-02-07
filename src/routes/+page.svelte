<script lang="ts">
	import Cookie from 'js-cookie';
	import { onMount } from 'svelte';
	let LoggedIn = $state(false);

	onMount(() => {
		const token = Cookie.get('token');
		console.log(token);
		if (token) LoggedIn = true;
	});
</script>

<h1>Welcome to <a href="https://s.ily.cat">s.ily.cat</a></h1>

{#if !LoggedIn}
	<span class="text-xl">Sign in to get started!</span>

	<div class="flex flex-row justify-evenly my-4">
		<a
			href="/api/login"
			class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded decoration-none hover:text-fake-white transition-colors duration-300 ease"
		>
			Log in
		</a>
		<!-- <a
		href="/api/register"
		class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded decoration-none hover:text-fake-white"
	>
		Register
	</a> -->
	</div>
{/if}
