<script context="module" lang="ts">
	import type { Log } from '~/src/routes/+page.svelte';

	export interface Message extends Log {}
</script>

<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	import { fly } from 'svelte/transition';
	import { decryptMessage } from '$lib/encryption';
	import { db } from '$lib/db';
	import { addToast } from '$lib/toasts';
	import { userStore } from '$lib/stores/firebase-store';
	import { deleteMessage } from '$lib/stores/messages';

	export let message: Message;
	export let components: Record<string, typeof SvelteComponent<any>>;
	export let guest: boolean = false;

	const user = userStore();

	const isComponent = message.type == 'component';
	let fullscreenDialog: HTMLDialogElement;
	let fullscreenDialogShown: boolean;
	let menu: HTMLDetailsElement;

	function getMessage() {
		if (message.encrypted) {
			// Tries to decrypt the message, if failed, return error message
			const key = localStorage.getItem('chat-os-encryption-key');

			if (!key) {
				return '[no encryption key set]';
			}

			try {
				const decrypted = decryptMessage(message.message, key);

				return decrypted;
			} catch (e) {
				console.info(e);
				return '[decryption failed]';
			}
		} else {
			return message.message;
		}
	}

	function getMeta() {
		if (message.encrypted) {
			// Tries to decrypt the message, if failed, return error message
			const key = localStorage.getItem('chat-os-encryption-key');

			if (!key) {
				return '[no encryption key set]';
			}

			try {
				const decrypted = decryptMessage(message.meta as string, key);

				return decrypted;
			} catch (e) {
				console.info(e);
				return '[decryption failed]';
			}
		} else {
			return message.meta;
		}
	}

	$: if (fullscreenDialogShown) {
		fullscreenDialog.addEventListener('close', () => {
			fullscreenDialogShown = false;
		});
	}

	function copyText() {
		const text = getMessage() as string;

		navigator.clipboard
			.writeText(text)
			.then(() => {
				addToast('Copied to clipboard', 'info');
			})
			.catch((err) => {
				console.error('Error copying text: ', err);
			});

		closeMenu();
	}

	async function deleteChatMessage() {
		closeMenu();

		if (!confirm('Are you sure you want to delete this message?')) {
			return;
		}

		if ($user) {
			try {
				await deleteMessage($user, message.id);
			} catch (e) {
				console.error(e);
			}
		} else {
			await db.chatLogs.delete(+message.id);
		}

		addToast('Deleted', 'warning');
	}

	function closeMenu() {
		menu.attributes.removeNamedItem('open');
	}
</script>

{#if isComponent}
	<dialog bind:this={fullscreenDialog} class="p-0 overflow-hidden">
		<div
			class="bg-primary w-[90vw] h-[90svh] relative rounded flex items-center justify-center overflow-hidden"
		>
			<button
				class="absolute top-2 right-2 btn btn-xs btn-primary btn-square"
				on:click={() => fullscreenDialog.close()}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-8 h-8"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			{#if fullscreenDialogShown}
				{#if getMessage() in components}
					<svelte:component
						this={components[getMessage()]}
						options={getMeta()}
						fullscreenMode={true}
					/>
				{/if}
			{/if}
		</div>
	</dialog>
{/if}

<div class="flex w-full">
	<div
		class="chat grow"
		class:chat-start={!message.self}
		class:chat-end={message.self}
		class:chat-bot={!message.self}
		class:chat-self={message.self}
		transition:fly|global={message.self ? { duration: 0 } : { y: 50, duration: 100 }}
	>
		<div class="chat-header flex items-center gap-1">
			<span class="font-medium">{!message.self ? 'ChatOS' : ''}{guest ? ' *' : ''}</span>
			<time class="text-xs text-secondary"
				>{message.time?.toDate().toLocaleString('en-US', {
					weekday: 'short',
					hour: 'numeric',
					minute: 'numeric',
					second: 'numeric',
					hour12: true
				})}</time
			>

			{#if message.encrypted}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-3 h-3 inline-block"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
					/>
				</svg>
			{/if}

			<details
				class="dropdown dropdown-bottom not-prose message-option"
				class:dropdown-end={message.self}
				bind:this={menu}
			>
				<summary class="btn btn-xs btn-ghost w-6 h-6 p-0 rounded-full">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-4 h-4"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
						/>
					</svg>
				</summary>
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<ul
					tabindex="0"
					class="dropdown-content z-[1] menu m-1 shadow bg-base-100 rounded-box text-sm"
				>
					<li><button on:click={copyText}>Copy</button></li>
					<li><button on:click={deleteChatMessage}>Delete</button></li>
				</ul>
			</details>
		</div>

		<div class="chat-bubble chat-bubble-primary relative group" role="log">
			{#if isComponent}
				<button
					class="hidden group-hover:block absolute top-2 right-2 btn btn-xs btn-primary btn-square"
					on:click={() => {
						fullscreenDialog.showModal();
						fullscreenDialogShown = true;
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
						/>
					</svg>
				</button>
			{/if}

			{#if message.type == 'image'}
				<img src={getMessage()} alt={getMeta().alt} />
			{:else if message.type == 'link'}
				<a href={getMessage()} target="_blank" rel="noreferrer" class="link">{getMessage()}</a>
			{:else if message.type == 'component'}
				{#if getMessage() in components}
					<!-- <Renderer component={components[getMessage()]} props={{}} /> -->
					<svelte:component this={components[getMessage()]} options={getMeta()} />
				{/if}
			{:else}
				{#each getMessage().split('\n') as line}
					<div>{line}</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
