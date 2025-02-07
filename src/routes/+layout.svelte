<script lang="ts">
	let { children } = $props();
</script>

<div class="w-full flex flex-col justify-center items-center">
	{@render children()}
</div>
