<script lang="ts">
	export let options: Record<string, string> = {};

	const seconds = +options.seconds || 60;
</script>

<span
	class="text-9xl font-semibold break-all flex text-center min-h-32 p-8 items-center justify-center"
	>{seconds} seconds</span
>
