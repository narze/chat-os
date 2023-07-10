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
</script>

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
