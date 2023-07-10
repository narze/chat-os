<script context="module" lang="ts">
	export type TimerWorkerMessageRequest = {
		endAt: number;
	};

	export type TimerWorkerMessageResponse = {
		ended: boolean;
	};

	export type PostMessage<T extends TimerWorkerMessageRequest | TimerWorkerMessageResponse> = T;
</script>

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import AlertIcon from './AlertIcon.svelte';
	import AlertDisabledIcon from './AlertDisabledIcon.svelte';
	import { dev } from '$app/environment';

	export let options: Record<string, string> = {};

	const timerSeconds = +options.seconds || 60;
	const startAt = +options.startAt;
	const endAt = startAt + timerSeconds * 1000;
	const name = options.name || undefined;

	let ended = endAt - Date.now() <= 0;
	let msLeft: number;
	let frame: number;
	let notificationState: NotificationPermission = Notification.permission;
	let worker: ServiceWorkerRegistration;
	let timerWorker: Worker | undefined = undefined;

	(function update() {
		frame = requestAnimationFrame(update);

		msLeft = endAt - Date.now();

		if (msLeft <= 0) {
			msLeft = 0;
			cancelAnimationFrame(frame);
		}
	})();

	onMount(async () => {
		if ('serviceWorker' in navigator) {
			worker = await navigator.serviceWorker.register('./service-worker.js', {
				type: dev ? 'module' : 'classic'
			});
		}

		if (!ended) {
			runTimerWorker();
		}
	});

	onDestroy(() => {
		cancelAnimationFrame(frame);
	});

	function format(seconds: number) {
		const minutes = Math.floor(seconds / 60);
		const secondsLeft = seconds % 60;

		return `${minutes}:${secondsLeft.toString().padStart(2, '0')}`;
	}

	async function runTimerWorker() {
		const TimerWorker = await import('$lib/workers/timer.worker?worker');
		timerWorker = new TimerWorker.default();

		const message: PostMessage<TimerWorkerMessageRequest> = { endAt };
		timerWorker.postMessage(message);

		timerWorker.onmessage = (event) => {
			const message: PostMessage<TimerWorkerMessageResponse> = event.data;

			if (message.ended && notificationState == 'granted') {
				worker.showNotification(`Timer ${format(timerSeconds)}${name ? ` - ${name}` : ''}`, {
					body: name ? `Timer ${name} ended` : 'Timer ended'
				});
			}
		};
	}
</script>

<div class="p-8 flex flex-col gap-2 w-full items-center">
	<div class="text-[max(2vw,1rem)] font-semibold">
		[ Timer {format(timerSeconds)}{name ? ` - ${name}` : ''} ]
	</div>
	<div class="text-[max(20vw,5rem)] break-all">
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
