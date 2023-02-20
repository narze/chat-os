<script lang="ts">
	interface Message {
		self?: boolean;
		msg: string;
	}

	let messageInput: string = '';

	let messages: Message[] = [{ msg: `Hello! I'm ChatOS! How can I help?` }];

	$: if (messages[messages.length - 1].self) {
		const lastMsg = messages[messages.length - 1];

		if (lastMsg.msg.match(/ping/i)) {
			botMessage('pong!');
		} else {
			botMessage(`Sorry I don't understand.`);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
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

	function botMessage(msg: string) {
		setTimeout(() => {
			messages = [
				...messages,
				{
					self: false,
					msg
				}
			];
		}, 100);
	}
</script>

<main class="prose lg:prose-lg max-w-full h-screen overflow-hidden">
	<div class="container mx-auto flex flex-col h-full">
		<div
			id="chat-box"
			class="flex flex-col gap-4 md:gap-6 m-auto p-4 flex-1 w-full overflow-y-auto"
		>
			{#each messages as message}
				<div class:chat-end={message.self} class:chat-start={!message.self} class="chat">
					<div class="chat-bubble chat-bubble-primary">{message.msg}</div>
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
				class="m-0 w-full resize-none border-0 bg-transparent p-0 pl-2 pr-7 dark:bg-transparent md:pl-0"
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
	/* Style for the chat box */
	#chat-box {
		overflow-y: auto;
	}

	/* Style for the input box */
	#input-box {
		margin-top: 10px;
		bottom: 0;
		position: fixed;
	}
</style>
