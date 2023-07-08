<script lang="ts">
	import { handleMessage } from '../lib/commands';
	import hi from '../lib/commands/hi';
	import ping from '../lib/commands/ping';
	import slowping from '../lib/commands/slowping';
	import others from '../lib/commands/others';
	import about from '../lib/commands/about';
	import qr from '../lib/commands/qr';
	import pp from '../lib/commands/promptpay-qr';
	import chatlog from '../lib/commands/chatlog';
	import timer from '../lib/commands/timer';
	import unknownCommand from '../lib/commands/unknown';
	import { SvelteComponent, onDestroy, onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import { db } from '../lib/db';
	import { liveQuery, type Observable } from 'dexie';
	import largeType from '../lib/commands/large-type';
	import LargeType from '../lib/commands/components/LargeType.svelte';
	// import Renderer from '../lib/commands/components/Renderer.svelte';

	// TODO: Load & unload commands
	const commands = [
		hi(),
		ping(),
		slowping(),
		others(),
		qr(),
		pp(),
		about(),
		chatlog(),
		largeType(),
		timer(),
		unknownCommand() // Make this the last one
	];

	const Components: Record<string, typeof SvelteComponent<any>> = {
		largetype: LargeType
	};

	interface Message {
		alt?: string;
		self?: boolean;
		msg: string;
		type?: string;
		time: Date;
	}

	let chatDiv: HTMLDivElement;

	let messageInput: string = '';
	let dbReady = false;

	$: messages = liveQuery(async () => {
		const chatLogs = await db.chatLogs.toArray();

		const messages = chatLogs.map((log) => ({
			self: !log.isBot,
			msg: log.message,
			time: log.time,
			type: log.type,
			alt: log.alt,
			meta: log.meta
		}));

		return messages;
	}) satisfies Observable<Message[]>;

	onMount(async () => {
		db.on('ready', () => {
			dbReady = true;
		});

		if ((await db.chatLogs.count()) == 0) {
			db.chatLogs.add({
				isBot: true,
				message: `Hello! I'm ChatOS! How can I help?`,
				time: new Date(),
				type: 'text'
			});
		}
	});

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
			if ($messages[$messages.length - 1]?.self) {
				scrollToBottom(chatDiv, 'auto');
			} else {
				debouncedScrollToBottom(chatDiv, 'smooth');
			}
		});
	}

	$: if ($messages && $messages[$messages.length - 1]?.self) {
		const lastMsg = $messages[$messages.length - 1].msg;

		handleMessage(lastMsg, onBotReply, onBotCommand);
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

		await db.chatLogs.add({
			isBot: false,
			message: messageInput,
			time: new Date(),
			type: 'text'
		});

		messageInput = '';
	}

	function onBotReply(msg: string, type: string = 'text', options: Record<string, any> = {}) {
		setTimeout(async () => {
			await db.chatLogs.add({
				isBot: true,
				message: msg,
				time: new Date(),
				type: type,
				alt: options.alt,
				meta: options
			});
		}, 100);
	}

	function onBotCommand(command: string) {
		if (command == 'clear') {
			db.on('ready', () => {
				setTimeout(async () => {
					await db.chatLogs.clear();
				}, 10);
			});
		}
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
				{#each $messages as message (message.time)}
					<div
						class="chat"
						class:chat-start={!message.self}
						class:chat-end={message.self}
						class:chat-bot={!message.self}
						class:chat-self={message.self}
						transition:fly|global={message.self ? { duration: 0 } : { y: 50, duration: 100 }}
					>
						<div class="chat-header">
							<span class="font-medium">{!message.self ? 'ChatOS' : ''}</span>
							<time class="text-xs text-secondary"
								>{message.time?.toLocaleString('en-US', {
									weekday: 'short',
									hour: 'numeric',
									minute: 'numeric',
									second: 'numeric',
									hour12: true
								})}</time
							>
						</div>
						<div class="chat-bubble chat-bubble-primary" role="log">
							{#if message.type == 'image'}
								<img src={message.msg} alt={message.alt} />
							{:else if message.type == 'link'}
								<a href={message.msg} target="_blank" rel="noreferrer" class="link">{message.msg}</a
								>
							{:else if message.type == 'component'}
								{#if message.msg in Components}
									<!-- <Renderer component={Components[message.msg]} props={{}} /> -->
									<svelte:component this={Components[message.msg]} options={message.meta} />
								{/if}
							{:else}
								{#each message.msg.split('\n') as line}
									<div>{line}</div>
								{/each}
							{/if}
						</div>
					</div>
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
