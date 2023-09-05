<script lang="ts" context="module">
	type EncryptedMeta = string;

	export interface Log {
		id: string;
		message: string;
		self: boolean;
		time: Timestamp;
		type: string;
		meta?: Record<string, any> | EncryptedMeta;
		guestSession?: boolean;
		encrypted?: boolean;
	}
</script>

<script lang="ts">
	import { encryptMessage } from '$lib/encryption';
	import { toasts } from '$lib/toasts';
	import { handleMessage } from '$lib/commands';
	import unknownCommand from '$lib/commands/unknown';
	import { onDestroy, tick } from 'svelte';
	import ChatMessage from '$lib/commands/components/ChatMessage.svelte';
	import type { BotMessageCallback, Components } from '$lib/commands';
	import { Timestamp } from 'firebase/firestore';
	import type { PageData } from './$types';
	import { liveQuery, type Observable } from 'dexie';
	import { db } from '$lib/db';
	import { fade } from 'svelte/transition';
	import { addMessage, firebaseChatMessages, loadMessages } from '$lib/stores/messages';

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

	$: guestMessages = liveQuery(async () => {
		const chatLogs = await db.chatLogs.toArray();

		const messages = chatLogs.map((log) => ({
			id: `${log.id}`,
			self: !log.isBot,
			message: log.message,
			time: Timestamp.fromDate(log.time),
			type: log.type,
			meta: log.meta,
			guestSession: log.guestSession
		})) satisfies Log[];

		return messages;
	}) satisfies Observable<Log[]>;

	$: if ($user) {
		loadMessages($user);
	}

	$: combinedMessages = $user
		? [...($firebaseChatMessages || []), ...$guestMessages].sort(
				(a, b) => a.time?.toDate().valueOf() - b.time?.toDate().valueOf()
		  )
		: $guestMessages;

	$: dbReady =
		$user !== undefined &&
		($user ? $firebaseChatMessages !== undefined : $guestMessages !== undefined);

	$: newLoggedInUser =
		$user && $firebaseChatMessages !== undefined && $firebaseChatMessages?.length === 0;
	$: newGuestUser = $user == null && $guestMessages !== undefined && $guestMessages?.length === 0;

	let greeted = false;
	$: if (dbReady && (newLoggedInUser || newGuestUser) && !greeted) {
		greeting();
	}

	$: if (dbReady && !newLoggedInUser && !newGuestUser) {
		greeted = true;
	}

	function greeting() {
		if (greeted) return;

		greeted = true;

		if ($user) {
			addMessage($user, {
				self: false,
				message: `Hello ${$user.displayName}!`,
				time: Timestamp.now(),
				type: 'text'
			});
		} else {
			db.chatLogs.add({
				guestSession: true,
				isBot: true,
				message: `Hello! I'm ChatOS! How can I help?`,
				time: new Date(),
				type: 'text'
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

	$: if (chatDiv && ($firebaseChatMessages?.length || $guestMessages?.length)) {
		tick().then(() => {
			if (
				$firebaseChatMessages?.[$firebaseChatMessages.length - 1]?.self ||
				$guestMessages?.[$guestMessages.length - 1]?.self
			) {
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

		// Add to Firestore or IndexedDB
		if ($user) {
			const encryptionKey = localStorage.getItem('chat-os-encryption-key');

			if (encryptionKey) {
				const encryptedMessage = encryptMessage(message, encryptionKey);

				await addMessage($user, {
					self: true,
					message: encryptedMessage,
					time: Timestamp.now(),
					type: 'text',
					encrypted: true
				});
			} else {
				await addMessage($user, {
					self: true,
					message,
					time: Timestamp.now(),
					type: 'text'
				});
			}
		} else {
			await db.chatLogs.add({
				guestSession: true,
				isBot: false,
				message,
				time: new Date(),
				type: 'text'
			});
		}
	}

	const onBotReply: BotMessageCallback = (message, payload) => {
		const type = payload?.type || 'text';
		const options = payload?.options || {};
		const encrypted = payload?.encrypted || false;

		setTimeout(async () => {
			if ($user) {
				const encryptionKey = localStorage.getItem('chat-os-encryption-key');

				if (encrypted && encryptionKey) {
					const encryptedMessage = encryptMessage(message, encryptionKey);
					const encryptedOptions = encryptMessage(options, encryptionKey);

					await addMessage($user, {
						self: false,
						message: encryptedMessage,
						time: Timestamp.now(),
						type,
						meta: encryptedOptions as unknown as Record<string, any>,
						encrypted: true
					});
				} else {
					await addMessage($user, {
						self: false,
						message,
						time: Timestamp.now(),
						meta: options,
						type
					});
				}
			} else {
				await db.chatLogs.add({
					guestSession: true,
					isBot: true,
					message,
					time: new Date(),
					type: type,
					meta: options
				});
			}
		}, 100);
	};

	function onBotCommand(command: string) {
		if (command == 'clear') {
			// TODO: Hide messages instead of deleting them
			db.on('ready', () => {
				setTimeout(async () => {
					await db.chatLogs.clear();
				}, 10);
			});
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
			{#each combinedMessages || [] as message (message.id)}
				<ChatMessage {message} {components} guest={message.guestSession} />
			{/each}
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
				autocapitalize="off"
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

		<div class="toast toast-center mb-16">
			{#each $toasts as toast}
				<div out:fade class={`alert alert-${toast.type}`}>
					<span>{toast.message}</span>
				</div>
			{/each}
		</div>
	</div>
</main>

<style>
</style>
