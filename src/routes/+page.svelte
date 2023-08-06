<script lang="ts" context="module">
	export interface Log {
		id: string;
		message: string;
		self: boolean;
		time: Timestamp;
		type: string;
		alt?: string;
		meta?: Record<string, any>;
		guestSession?: boolean;
		encrypted?: boolean;
	}
</script>

<script lang="ts">
	import { secretbox, randomBytes } from 'tweetnacl';
	import { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

	import { handleMessage } from '$lib/commands';
	import unknownCommand from '$lib/commands/unknown';
	import { onDestroy, tick } from 'svelte';
	import ChatMessage from '$lib/commands/components/ChatMessage.svelte';
	import type { Components, Message } from '$lib/commands';
	import { firestore } from '$lib/firebase';
	import { collectionStore } from '$lib/firebase-store';
	import { Timestamp, collection, orderBy, query, type DocumentData } from 'firebase/firestore';
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

	$: guestMessages = liveQuery(async () => {
		const chatLogs = await db.chatLogs.toArray();

		const messages = chatLogs.map((log) => ({
			id: `${log.id}`,
			self: !log.isBot,
			message: log.message,
			time: Timestamp.fromDate(log.time),
			type: log.type,
			alt: log.alt,
			meta: log.meta,
			guestSession: log.guestSession
		})) satisfies Log[];

		return messages;
	}) satisfies Observable<Log[]>;

	let messagesQuery: ReturnType<typeof query<DocumentData, DocumentData>>;
	let messages: ReturnType<typeof collectionStore<Log>>;
	let messagesCollection: ReturnType<typeof collectionStore<Log>>;

	$: if ($user) {
		messagesQuery = query(collection(firestore, `users/${$user.uid}/messages`), orderBy('time'));
		messages = collectionStore<Log>(firestore, messagesQuery);
		messagesCollection = collectionStore<Log>(firestore, `users/${$user.uid}/messages`);
	}

	$: combinedMessages = $user
		? [...($messages || []), ...$guestMessages].sort(
				(a, b) => a.time?.toDate().valueOf() - b.time?.toDate().valueOf()
		  )
		: $guestMessages;

	$: dbReady =
		$user !== undefined && ($user ? $messages !== undefined : $guestMessages !== undefined);

	$: newLoggedInUser = $user && $messages !== undefined && $messages?.length === 0;
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
			messagesCollection.add({
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

	$: if (chatDiv && ($messages?.length || $guestMessages?.length)) {
		tick().then(() => {
			if (
				$messages?.[$messages.length - 1]?.self ||
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

				await messagesCollection.add({
					self: true,
					message: encryptedMessage,
					time: Timestamp.now(),
					type: 'text',
					encrypted: true
				});
			} else {
				await messagesCollection.add({
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

	const encryptMessage = (json: string, key: string) => {
		const keyUint8Array = decodeBase64(key);
		const nonce = randomBytes(secretbox.nonceLength);
		const messageUint8 = decodeUTF8(JSON.stringify(json));
		const box = secretbox(messageUint8, nonce, keyUint8Array);

		const fullMessage = new Uint8Array(nonce.length + box.length);
		fullMessage.set(nonce);
		fullMessage.set(box, nonce.length);

		const base64FullMessage = encodeBase64(fullMessage);
		return base64FullMessage;
	};

	function onBotReply(msg: string, type: string = 'text', options: Record<string, any> = {}) {
		setTimeout(async () => {
			if ($user) {
				const data = {
					self: false,
					message: msg,
					time: Timestamp.now(),
					type: type,
					alt: options.alt || null,
					meta: options
				};

				await messagesCollection.add(data);
			} else {
				await db.chatLogs.add({
					guestSession: true,
					isBot: true,
					message: msg,
					time: new Date(),
					type: type,
					alt: options.alt,
					meta: options
				});
			}
		}, 100);
	}

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
	</div>
</main>

<style>
</style>
