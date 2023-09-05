<script lang="ts">
	import { firestore } from '$lib/firebase';
	import { collectionStore } from '$lib/stores/firebase-store';

	interface Post {
		message: string;
	}

	const posts = collectionStore<Post>(firestore, 'posts');

	async function addPost() {
		const docRef = await posts.add!({
			message: 'Hi ' + Date.now()
		});

		return docRef;
	}
</script>

<button on:click={() => addPost()}> Add post </button>

{#if $posts === undefined}
	<p>Loading...</p>
{:else if $posts.length}
	{#each $posts as post}
		<p>{post.message}</p>
	{/each}
{:else}
	<p>No posts</p>
{/if}
