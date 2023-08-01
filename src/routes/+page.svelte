<script lang="ts" context="module">
	export interface Log {
		id: string;
		message: string;
		self: boolean;
		time: Timestamp;
		type: string;
		alt?: string;
		meta?: Record<string, any>;
		sessionId: string;
	}
</script>

<script lang="ts">
	import { nanoid } from 'nanoid';
	import { handleMessage } from '$lib/commands';
	import unknownCommand from '$lib/commands/unknown';
	import { onDestroy, tick } from 'svelte';
	import ChatMessage from '$lib/commands/components/ChatMessage.svelte';
	import type { Components, Message } from '$lib/commands';
	import { firestore } from '$lib/firebase';
	import { collectionStore } from '$lib/firebase-store';
	import { Timestamp, collection, orderBy, query, type DocumentData } from 'firebase/firestore';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';
	import { liveQuery, type Observable } from 'dexie';
	import { db } from '$lib/db';

	export let data: PageData;
	let { user } = data;

	const commandsLoader = import.meta.glob('$lib/commands/*.ts', { eager: true }) as Record<
		string,
		{ default: () => void; components?: Components }
	>;
	const cmd = Object.entries(commandsLoader)
		.filter(([name, _]) => !name.endsWith('index.ts'))
		.map(([_, module]) => module.default);

	// Makes unknownCommand the last command
	const commands = reorderCommands(cmd, [unknownCommand]);
	commands.forEach((command) => command());

	// Load components
	const components: Components = Object.entries(commandsLoader)
		.filter(([name, _]) => !name.endsWith('index.ts'))
		.map(([_, module]) => module.components)
		.reduce((a, b) => ({ ...a, ...b }), {})!;

	let chatDiv: HTMLDivElement;
	let messageInput: string = '';
	let dbReady = false;

	// TODO: Merge guest's messages when they sign in
	let sessionId: string;
	let messagesQuery: ReturnType<typeof query<DocumentData, DocumentData>>;
	let messages: ReturnType<typeof collectionStore<Log>>;
	let messagesCollection: ReturnType<typeof collectionStore<Log>>;

	$: if ($user) {
		sessionId = $user.uid;

		messagesQuery = query(collection(firestore, `users/${sessionId}/messages`), orderBy('time'));
		messages = collectionStore<Log>(firestore, messagesQuery);
		messagesCollection = collectionStore<Log>(firestore, `users/${sessionId}/messages`);
	} else if ($user === null) {
		sessionId = (browser ? localStorage.getItem('sessionId') : '') || nanoid();

		messagesQuery = query(collection(firestore, `guests/${sessionId}/messages`), orderBy('time'));
		messages = collectionStore<Log>(firestore, messagesQuery);
		messagesCollection = collectionStore<Log>(firestore, `guests/${sessionId}/messages`);
	}

	$: if (browser && sessionId && $user !== undefined && $user === null) {
		localStorage.setItem('sessionId', sessionId);
	}

	$: dbReady = messages !== undefined;

	$: if (dbReady && $messages?.length === 0) {
		if ($user) {
			messagesCollection.add({
				self: false,
				message: `Hello ${$user.displayName}!`,
				time: Timestamp.now(),
				type: 'text',
				sessionId
			});
		} else {
			messagesCollection.add({
				self: false,
				message: `Hello! I'm ChatOS! How can I help?`,
				time: Timestamp.now(),
				type: 'text',
				sessionId
			});
		}
	}

	onDestroy(() => {
		commands.forEach((deregister) => deregister());
	});

	const scrollToBottom = async (node: HTMLElement, behavior?: ScrollBehavior) => {
		node.scroll({ top: node.scrollHeight, behavior });
	};

	const debounce = (func: Function, delay: number) => {
		let timer: NodeJS.Timeout;

		return (...args: any[]) => {
			clearTimeout(timer);
			timer = setTimeout(() => func(...args), delay);
		};
	};

	const debouncedScrollToBottom = debounce(scrollToBottom, 100);

	$: if (chatDiv && $messages?.length) {
		tick().then(() => {
			if ($messages?.[$messages.length - 1]?.self) {
				scrollToBottom(chatDiv, 'auto');
			} else {
				debouncedScrollToBottom(chatDiv, 'smooth');
			}
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			sendMessage();
		}
	}

	async function sendMessage() {
		if (!messageInput.length) {
			return;
		}

		const message = messageInput;
		messageInput = '';

		handleMessage(message, onBotReply, onBotCommand);

		// Add to Firestore
		await messagesCollection.add({
			self: true,
			message: message,
			time: Timestamp.now(),
			type: 'text',
			sessionId
		});
	}

	function onBotReply(msg: string, type: string = 'text', options: Record<string, any> = {}) {
		setTimeout(async () => {
			const data = {
				self: false,
				message: msg,
				time: Timestamp.now(),
				type: type,
				alt: options.alt || null,
				meta: options,
				sessionId
			};

			await messagesCollection.add(data);
		}, 100);
	}

	function onBotCommand(command: string) {
		if (command == 'clear') {
			// TODO: Hide messages instead of deleting them
		}
	}

	function reorderCommands(input: any[], argsToBack: any[]) {
		input.sort(function (a, b) {
			if (argsToBack.includes(b)) {
				return -1; // Move b to the back
			}
			return 0; // Maintain the original order
		});

		return input;
	}
</script>

<svelte:head>
	<title>ChatOS</title>
</svelte:head>

<svelte:body data-testid="db-ready" />

<main class="prose lg:prose-lg max-w-full h-[100svh] overflow-hidden" data-db-ready={dbReady}>
	<div class="container mx-auto flex flex-col h-full">
		<div
			bind:this={chatDiv}
			class="flex flex-col gap-4 md:gap-6 mx-auto my-2 p-4 flex-1 w-full overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary"
		>
			{#if $messages}
				{#each $messages as message (message.id)}
					<ChatMessage {message} {components} />
				{/each}
			{/if}
		</div>

		<div
			class="flex flex-col py-2 flex-0 md:py-3 md:pl-4 relative border border-secondary rounded-md md:mb-4"
		>
			<textarea
				bind:value={messageInput}
				on:keydown={handleKeydown}
				tabindex="0"
				rows="1"
				class="m-0 w-full resize-none border-0 bg-transparent p-0 pl-2 pr-7 dark:bg-transparent md:pl-0 focus:outline-none"
				style="max-height: 200px; overflow-y: hidden;"
				placeholder="Type your message..."
			/>
			<button
				class="absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2"
				aria-label="Send message"
				on:click={sendMessage}
			>
				<svg
					stroke="currentColor"
					fill="none"
					stroke-width="2"
					viewBox="0 0 24 24"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-4 w-4 mr-1 text-secondary"
					height="1em"
					width="1em"
					xmlns="http://www.w3.org/2000/svg"
					><line x1="22" y1="2" x2="11" y2="13" /><polygon
						points="22 2 15 22 11 13 2 9 22 2"
					/></svg
				>
			</button>
		</div>
	</div>
</main>

<style>
</style>
