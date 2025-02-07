<script lang="ts">
	import type { PageProps } from './$types';
	import LoginForm from '$lib/components/LoginForm.client.svelte';

	let { data }: PageProps = $props();
</script>

<div>
	<h1>Welcome to <a href="https://s.ily.cat">s.ily.cat</a></h1>

	<LoginForm loggedIn={data.LoggedIn} />
</div>
