<script lang="ts">
	export let options: Record<string, string> = {};

	const text = options.text || '';
</script>

<span
	class="text-9xl font-semibold break-all flex text-center min-h-32 p-8 items-center justify-center"
	>{text}</span
>
