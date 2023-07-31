<script lang="ts">
	import { auth } from '$lib/firebase';
	import { userStore } from '$lib/firebase-store';
	import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

	const provider = new GoogleAuthProvider();
	const user = userStore();

	async function signIn() {
		const user = await signInWithPopup(auth, provider);

		// FIXME: Sync user's data without reloading the page
		location.reload();
	}

	async function signOut() {
		await auth.signOut();

		// FIXME: Sync user's data without reloading the page
		location.reload();
	}
</script>

{#if $user === undefined}
	<p>Loading...</p>
{:else if $user}
	<p>Logged in as {$user.displayName}</p>
	<button class="btn btn-sm btn-secondary" on:click={() => alert('Work in progress...')}
		>Sync chat</button
	>
	<button class="btn btn-sm btn-default" on:click={signOut}>Sign out</button>
{:else}
	<p>Not logged in</p>
	<button class="btn btn-sm btn-secondary" on:click={signIn}>Sign in with Google</button>
{/if}
