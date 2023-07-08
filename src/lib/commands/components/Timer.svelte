<script lang="ts">
	import { onDestroy } from 'svelte';
	import AlertIcon from './AlertIcon.svelte';
	import AlertDisabledIcon from './AlertDisabledIcon.svelte';

	export let options: Record<string, string> = {};

	const timerSeconds = +options.seconds || 60;
	const startAt = +options.startAt;
	const endAt = startAt + timerSeconds * 1000;
	const name = options.name || undefined;

	let ended = endAt - Date.now() <= 0;
	let msLeft: number;
	let frame: number;
	let notificationState: NotificationPermission = Notification.permission;

	(function update() {
		frame = requestAnimationFrame(update);

		msLeft = endAt - Date.now();

		if (msLeft <= 0) {
			msLeft = 0;
			cancelAnimationFrame(frame);

			if (!ended) {
				ended = true;

				if (notificationState == 'granted') {
					new Notification('Timer ended', {
						body: name ? `Timer ${name} ended` : 'Timer ended'
					});
				}
			}
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
		[ Timer {format(timerSeconds)}{name ? ` - ${name}` : ''} ]
	</div>
	<div class="text-7xl break-all">
		{format(Math.ceil(msLeft / 1000))}
	</div>

	{#if msLeft > 0}
		{#if notificationState == 'default'}
			<button
				class="btn btn-outline btn-circle btn-sm mt-2"
				on:click={() =>
					Notification.requestPermission().then((state) => (notificationState = state))}
			>
				<AlertIcon />
			</button>
		{:else if notificationState == 'granted'}
			<button class="btn btn-circle btn-success btn-sm mt-2">
				<AlertIcon />
			</button>
		{:else if notificationState == 'denied'}
			<button
				class="btn btn-outline btn-circle btn-danger btn-sm mt-2"
				on:click={() => {
					alert('Notifications are blocked. Please unblock on your browser.');
				}}
			>
				<AlertDisabledIcon />
			</button>
		{/if}
	{/if}
</div>
