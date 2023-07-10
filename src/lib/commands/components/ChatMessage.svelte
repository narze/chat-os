<script context="module" lang="ts">
	export interface Message {
		alt?: string;
		self?: boolean;
		msg: string;
		type?: string;
		time: Date;
		meta?: Record<string, string>;
	}
</script>

<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	import { fly } from 'svelte/transition';

	export let message: Message;
	export let components: Record<string, typeof SvelteComponent<any>>;

	const isComponent = message.type == 'component';
	let showExpandButton = false;
	let expanded = false;
	let expandedDialog: HTMLDialogElement;

	function mouseenter() {
		if (isComponent) {
			showExpandButton = true;
		}
	}

	function mouseleave() {
		if (isComponent) {
			showExpandButton = false;
		}
	}

	function expand() {
		if (isComponent) {
			expanded = true;
		}
	}

	function unexpand() {
		if (isComponent) {
			expanded = false;
			expandedDialog.close();
		}
	}

	$: if (expanded) {
		if (isComponent) {
			expandedDialog.showModal();
		}
	}

	$: if (expandedDialog) {
		expandedDialog.addEventListener('close', () => {
			unexpand();
		});
	}
</script>

{#if isComponent}
	<dialog bind:this={expandedDialog} class="p-0 overflow-hidden">
		<div
			class="bg-primary w-[90vw] h-[90svh] relative rounded flex items-center justify-center overflow-hidden"
		>
			<button class="absolute top-2 right-2 btn btn-xs btn-primary btn-square" on:click={unexpand}>
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

			{#if expanded}
				{#if message.msg in components}
					<svelte:component
						this={components[message.msg]}
						options={message.meta}
						fullscreenMode={true}
					/>
				{/if}
			{/if}
		</div>
	</dialog>
{/if}

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
	<div
		class="chat-bubble chat-bubble-primary relative"
		role="log"
		on:mouseenter={mouseenter}
		on:mouseleave={mouseleave}
	>
		{#if showExpandButton}
			<button class="absolute top-2 right-2 btn btn-xs btn-primary btn-square" on:click={expand}>
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
			<img src={message.msg} alt={message.alt} />
		{:else if message.type == 'link'}
			<a href={message.msg} target="_blank" rel="noreferrer" class="link">{message.msg}</a>
		{:else if message.type == 'component'}
			{#if message.msg in components}
				<!-- <Renderer component={components[message.msg]} props={{}} /> -->
				<svelte:component this={components[message.msg]} options={message.meta} />
			{/if}
		{:else}
			{#each message.msg.split('\n') as line}
				<div>{line}</div>
			{/each}
		{/if}
	</div>
</div>
