<script lang="ts">
	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();

		const formData = new FormData(e.currentTarget as HTMLFormElement);

		const response = await fetch('/api/login', {
			method: 'POST',
			body: formData,
		});

		const data = await response.json();

		if (data.redirect) location.href = data.redirect;

		return alert(data.message);
	}
</script>

<form {onsubmit} class="w-full max-w-md mx-auto flex flex-col justify-center items-center">
	<ol class="flex flex-col justify-center">
		<il class="ml--12px pl-2 rounded-sm border-l-4 border-purple-600 text-lg mb-2">
			Login
			<span class="text-red-600">*</span>
		</il>
		<il>
			<input
				type="text"
				id="login"
				name="login"
				autocapitalize="none"
				autocomplete="username"
				placeholder="username/handle"
				minlength="3"
				maxlength="32"
				class="p-2"
				required
			/>
		</il>
		<il class="ml--12px pl-2 rounded-sm border-l-4 border-purple-600 text-lg my-2">
			Password
			<span class="text-red-600">*</span>
		</il>
		<il>
			<input
				type="password"
				id="password"
				name="password"
				placeholder="********"
				autocomplete="current-password"
				minlength="8"
				class="p-2"
				required
			/>
		</il>
	</ol>
	<div class="my-4 text-center">
		<input
			type="checkbox"
			id="terms"
			name="terms"
			class="bottom-0 h-5 left-0 right-0 top-0 !w-5"
			required
		/>
		<label for="terms" class="cursor-pointer">
			I agree to the <a href="/terms">terms and conditions</a>.
		</label>
	</div>
	<div class="w-full flex justify-evenly">
		<button type="submit" name="submit" class="w-24 p-3 rounded-lg">Log In</button>
		<slot />
	</div>
</form>

<style lang="postcss">
	@reference "tailwindcss";

	input {
		@apply w-full bg-gray-500;
		@apply rounded-xl border-2 border-t-red-800 border-l-red-800 border-red-600;
		&:focus {
			@apply outline-none;
			@apply border-t-purple-600 border-l-purple-600 border-purple-800;
		}
	}

	button {
		@apply cursor-pointer bg-blue-500;
		@apply border-2 border-t-white border-l-white border-blue-700;
		&:focus {
			@apply outline-none;
			@apply border-b-white border-r-white border-blue-700;
		}
	}
</style>
