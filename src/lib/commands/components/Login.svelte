<script lang="ts">
	import { auth, firestore } from '$lib/firebase';
	import { collectionStore, userStore } from '$lib/firebase-store';
	import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
	import { db } from '$lib/db';
	import type { Log } from '~/src/routes/+page.svelte';
	import { Timestamp } from 'firebase/firestore';

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

	async function syncChat() {
		const chatLogs = await db.chatLogs.toArray();

		if (chatLogs.length == 0) {
			alert('No chat logs to sync');
			return;
		}

		if (
			$user &&
			confirm(`Sync ${chatLogs.length} entries of chat logs in guest session to your account?`)
		) {
			const messagesCollection = collectionStore<Log>(firestore, `users/${$user.uid}/messages`);

			chatLogs.forEach((log) => {
				db.chatLogs.delete(log.id!);

				messagesCollection.add({
					self: !log.isBot,
					message: log.message,
					time: Timestamp.fromDate(log.time),
					type: log.type,
					// alt: log.alt,
					meta: log.meta || {}
				});
			});

			messagesCollection.add({
				self: false,
				message: `Synced ${chatLogs.length} entries of chat logs in guest session to your account`,
				time: Timestamp.now(),
				type: 'text'
			});
		}
	}

	function setEncryptionKey() {
		const key = prompt('Enter encryption key (this will be stored in your browser only)');

		if (key) {
			localStorage.setItem('chat-os-encryption-key', key);
		} else {
			if (confirm('Are you sure you want to remove the encryption key?')) {
				localStorage.removeItem('chat-os-encryption-key');
			}
		}
	}

	function showEncryptionKey() {
		const key = localStorage.getItem('chat-os-encryption-key');

		if (key) {
			alert(key);
		} else {
			alert('Error: No encryption key set');
		}
	}
</script>

{#if $user === undefined}
	<p>Loading...</p>
{:else if $user}
	<p>Logged in as {$user.displayName}</p>
	<button class="btn btn-sm btn-secondary" on:click={syncChat}>Sync chat</button>
	<button class="btn btn-sm btn-secondary" on:click={setEncryptionKey}>Set encryption key</button>
	<button class="btn btn-sm btn-secondary" on:click={showEncryptionKey}>Show encryption key</button>
	<button class="btn btn-sm btn-default" on:click={signOut}>Sign out</button>
{:else}
	<p>Not logged in</p>
	<button class="btn btn-sm btn-secondary" on:click={signIn}>Sign in with Google</button>
{/if}
