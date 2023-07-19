<script lang="ts">
	import fitty from 'fitty/dist/fitty.min.js';

	// export let options: Record<string, string> = {};
	export let fullscreenMode: boolean;

	const text = 'Login';

	let textElement: HTMLElement;

	$: if (fullscreenMode && textElement) {
		fitty(textElement);
	}
</script>

{#if fullscreenMode}
	<span bind:this={textElement} class="font-semibold">{text}</span>
{:else}
	<span
		class="text-9xl font-semibold break-all flex text-center min-h-32 p-8 items-center justify-center"
		>{text}</span
	>
{/if}
