<script lang="ts">
	const { loggedIn } = $props();

	async function submit(e: SubmitEvent) {
		e.preventDefault();

		const formData = new FormData(e.currentTarget as HTMLFormElement);

		const response = await fetch('/api/login', {
			method: 'POST',
			body: formData,
		});

		const data = await response.json();
		return alert(data.message);
	}
</script>

{#if !loggedIn}
	<form onsubmit={submit} class="w-full flex flex-col justify-center items-center">
		<ol class="flex flex-col">
			<il class="pl-2 rounded-sm b-l-4 !border-purple-600 text-lg mb-2">Login:</il>
			<il>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="text"
					id="login"
					name="login"
					autocapitalize="none"
					autocomplete="username"
					autofocus
					class="w-64 rounded-xl bg-gray-500 text-white p-2 border-2 border-red-6 focus:outline-none focus:border-purple-600"
					required
				/>
			</il>
			<il class="pl-2 rounded-sm b-l-4 !border-purple-600 text-lg my-2">Password:</il>
			<il>
				<input
					type="password"
					id="password"
					name="password"
					autocomplete="current-password"
					class="w-64 rounded-xl bg-gray-500 text-white p-2 border-2 border-red-6 focus:outline-none focus:border-purple-600"
					required
				/>
			</il>
		</ol>
		<div class="mb-4">
			<input type="checkbox" id="terms" class="bottom-0 h-5 left-0 right-0 top-0 w-5" required />
			<label for="terms" class="cursor-pointer">
				I agree to the <a href="/terms">terms and conditions</a>.
			</label>
		</div>
		<button class="w-28 p-4 bg-blue-500 m-auto rounded-lg mb-10">Log In</button>
	</form>
{:else}
	<p class="text-center">You are already logged in.</p>
{/if}
