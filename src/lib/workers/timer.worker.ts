import type {
	PostMessage,
	TimerWorkerMessageRequest,
	TimerWorkerMessageResponse
} from '../commands/components/Timer.svelte';

onmessage = (message: MessageEvent<PostMessage<TimerWorkerMessageRequest>>) => {
	const { endAt } = message.data;

	const intervalId = setInterval(() => {
		if (Date.now() >= endAt) {
			clearInterval(intervalId);
			postMessage({ ended: true } as PostMessage<TimerWorkerMessageResponse>);
		}
	}, 1000);
};

// export {};
