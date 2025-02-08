<script lang="ts">
	import LoginForm from '$lib/components/LoginForm.client.svelte';
	import RegisterForm from '$lib/components/RegisterForm.client.svelte';

	let ShowRegister = $state(false);
</script>

<h1 class="text-4xl font-bold text-center my-4">
	Welcome to <a href="https://s.ily.cat">s.ily.cat</a>
</h1>

{#if ShowRegister}
	<RegisterForm>
		<button
			class="mt-2 cursor-pointer underline text-violet-700 hover:text-violet-800"
			onclick={() => (ShowRegister = false)}
			type="button"
		>
			Have an account? Log in!
		</button>
	</RegisterForm>
{:else}
	<LoginForm>
		<button
			class="mt-2 cursor-pointer underline text-violet-700 hover:text-violet-800"
			onclick={() => (ShowRegister = true)}
		>
			Create an account
		</button>
	</LoginForm>
{/if}
