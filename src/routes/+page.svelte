<script lang="ts">
	import { handleMessage } from '../lib/commands';
	import hi from '../lib/commands/hi';
	import ping from '../lib/commands/ping';
	import slowping from '../lib/commands/slowping';
	import others from '../lib/commands/others';
	import about from '../lib/commands/about';
	import qr from '../lib/commands/qr';
	import pp from '../lib/commands/promptpay-qr';
	import unknownCommand from '../lib/commands/unknown';

	// TODO: Load & unload commands
	hi();
	ping();
	slowping();
	others();
	qr();
	pp();
	about();
	unknownCommand(); // Make this the last one

	interface Message {
		alt?: string;
		self?: boolean;
		msg: string;
		type?: string;
		time: Date;
	}

	let messageInput: string = '';

	let messages: Message[] = [{ msg: `Hello! I'm ChatOS! How can I help?`, time: new Date() }];

	$: if (messages[messages.length - 1].self) {
		const lastMsg = messages[messages.length - 1].msg;

		handleMessage(lastMsg, onBotReply, onBotCommand);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			sendMessage();
		}
	}

	function sendMessage() {
		if (!messageInput.length) {
			return;
		}

		messages = [
			...messages,
			{
				self: true,
				msg: messageInput,
				time: new Date()
			}
		];

		messageInput = '';
	}

	function onBotReply(msg: string, type: string = 'text', options: Record<string, any> = {}) {
		setTimeout(() => {
			messages = [
				...messages,
				{
					self: false,
					msg,
					type,
					time: new Date(),
					...options
				}
			];
		}, 100);
	}

	function onBotCommand(command: string) {
		if (command == 'clear') {
			messages = [];
		}
	}
</script>

<main class="prose lg:prose-lg max-w-full h-[100svh] overflow-hidden">
	<div class="container mx-auto flex flex-col h-full">
		<div class="flex flex-col gap-4 md:gap-6 m-auto p-4 flex-1 w-full overflow-y-auto">
			{#each messages as message}
				<div
					class="chat"
					class:chat-start={!message.self}
					class:chat-end={message.self}
					class:chat-bot={!message.self}
					class:chat-self={message.self}
				>
					<div class="chat-header">
						{!message.self ? 'ChatOS' : ''}
						<time class="text-xs opacity-50"
							>{message.time?.toLocaleString('en-US', {
								weekday: 'short',
								hour: 'numeric',
								minute: 'numeric',
								hour12: true
							})}</time
						>
					</div>
					<div class="chat-bubble chat-bubble-primary" role="log">
						{#if message.type == 'image'}
							<img src={message.msg} alt={message.alt} />
						{:else if message.type == 'link'}
							<a href={message.msg} target="_blank" rel="noreferrer" class="link">{message.msg}</a>
						{:else}
							{message.msg}
						{/if}
					</div>
				</div>
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
			/>
			<button
				class="absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2"
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
