<!-- Maybe useful in the future? -->
<!-- <script lang="ts">
	import type { SvelteComponentTyped } from 'svelte/internal';

	type C = $$Generic<typeof SvelteComponentTyped<any, any, any>>;

	export let component: C;
	export let props: C extends typeof SvelteComponentTyped<infer P extends Record<string, any>>
		? P
		: never;
</script>

<svelte:component this={component} {...props} /> -->
