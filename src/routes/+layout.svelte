<script lang="ts">
	let { children } = $props();
</script>

<div class="flex flex-col text-center">
	{@render children()}
</div>
