<script lang="ts">
	interface Message {
		self?: boolean;
		msg: string;
		type?: string;
	}

	let messageInput: string = '';

	let messages: Message[] = [{ msg: `Hello! I'm ChatOS! How can I help?` }];

	$: if (messages[messages.length - 1].self) {
		const lastMsg = messages[messages.length - 1].msg;
		if (lastMsg.match(/^commands$/i)) {
			botMessage(`Here are the commands I can do: ping, commands, qr, about, clear`);
		} else if (lastMsg.match(/^qr/i)) {
			// If having text after space
			const matches = lastMsg.match(/^qr(\s+)(.*)$/i);
			if (matches && matches[2]) {
				const qrText = matches[2];

				// TODO: Generate base64 QR code
				botMessage(
					`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrText}`,
					'image'
				);
			} else {
				botMessage(`Please enter text after "qr" to generate a QR code!`);
			}
		} else if (lastMsg == 'about') {
			botMessage('This is a demo of the ChatOS project. Check out the source code on GitHub!');
			botMessage('https://github.com/narze/chat-os', 'link');
		} else if (lastMsg == 'clear') {
			messages = [];
			botMessage('(messages cleared)');
		} else if (lastMsg == 'hi') {
			botMessage('Hello!');
		} else if (lastMsg.match(/^ping$/i)) {
			botMessage('pong!');
		} else {
			botMessage(`Sorry I don't understand... (Type "commands" to see what I can do)`);
		}
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
				msg: messageInput
			}
		];

		messageInput = '';
	}

	function botMessage(msg: string, type: string = 'text') {
		setTimeout(() => {
			messages = [
				...messages,
				{
					self: false,
					msg,
					type
				}
			];
		}, 100);
	}
</script>

<main class="prose lg:prose-lg max-w-full h-screen overflow-hidden">
	<div class="container mx-auto flex flex-col h-full">
		<div class="flex flex-col gap-4 md:gap-6 m-auto p-4 flex-1 w-full overflow-y-auto">
			{#each messages as message}
				<div class:chat-end={message.self} class:chat-start={!message.self} class="chat">
					<div class="chat-bubble chat-bubble-primary">
						{#if message.type == 'image'}
							<img src={message.msg} alt={'QR Code'} />
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
