<script lang="ts">
	import { onDestroy } from 'svelte';

	export let options: Record<string, string> = {};

	const timerSeconds = +options.seconds || 60;
	const startAt = +options.startAt;
	const endAt = startAt + timerSeconds * 1000;

	let msLeft: number;
	let frame: number;

	(function update() {
		frame = requestAnimationFrame(update);

		msLeft = endAt - Date.now();

		if (msLeft <= 0) {
			msLeft = 0;
			cancelAnimationFrame(frame);
		}
	})();

	onDestroy(() => {
		cancelAnimationFrame(frame);
	});

	function format(seconds: number) {
		const minutes = Math.floor(seconds / 60);
		const secondsLeft = seconds % 60;

		return `${minutes}:${secondsLeft.toString().padStart(2, '0')}`;
	}
</script>

<div class="p-8 flex flex-col gap-2">
	<div class="font-semibold">
		[ Timer {format(timerSeconds)} ]
	</div>
	<div class="text-7xl break-all">
		{format(Math.ceil(msLeft / 1000))}
	</div>
</div>
