<script lang="ts">
	import LoginForm from '$lib/components/LoginForm.client.svelte';
	import RegisterForm from '$lib/components/RegisterForm.client.svelte';

	let ShowRegister = $state(false);
</script>

<h1 class="text-5xl text-center my-4">
	Welcome to <a href="https://s.ily.cat" class="">s.ily.cat</a>
</h1>

{#if ShowRegister}
	<RegisterForm>
		<button
			class="mt-2 cursor-pointer underline text-violet-700 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-500"
			onclick={() => (ShowRegister = false)}
			type="button"
		>
			Have an account? Log in!
		</button>
	</RegisterForm>
{:else}
	<LoginForm>
		<button
			class="mt-2 cursor-pointer underline text-violet-700 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-500"
			onclick={() => (ShowRegister = true)}
		>
			Create an account
		</button>
	</LoginForm>
{/if}

<style>
	@keyframes animate-gradient {
		0% {
			background-position: 0% 50%;
		}
		100% {
			background-position: 200% 50%;
		}
	}
	@keyframes gradientText {
	}

	a[href] {
		animation: animate-gradient 3s linear infinite;
		background: linear-gradient(90deg, #ff0000, #ffff00, #ffffff, #00ffff, #0000ff, #000000, #ff0000);
		background-size: 200% 100%;
		color: transparent;
		-webkit-background-clip: text;
		background-clip: text;
	}
</style>
