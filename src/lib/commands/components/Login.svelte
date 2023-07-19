<script lang="ts">
	import { auth } from '$lib/firebase';
	import { userStore } from '$lib/firebase-store';
	import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

	const provider = new GoogleAuthProvider();
	const user = userStore();

	function signIn() {
		signInWithPopup(auth, provider);
	}
</script>

{#if $user === undefined}
	<p>Loading...</p>
{:else if $user}
	<p>Logged in as {$user.displayName}</p>
	<button class="btn btn-sm btn-secondary" on:click={() => alert('Work in progress...')}
		>Sync chat</button
	>
	<button class="btn btn-sm btn-default" on:click={() => auth.signOut()}>Sign out</button>
{:else}
	<p>Not logged in</p>
	<button class="btn btn-sm btn-secondary" on:click={signIn}>Sign in with Google</button>
{/if}
