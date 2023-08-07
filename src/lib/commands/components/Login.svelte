<script lang="ts">
	import { pbkdf2Async } from '@noble/hashes/pbkdf2';
	import { sha256 } from '@noble/hashes/sha256';
	import { encodeBase64 } from 'tweetnacl-util';
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

		localStorage.removeItem('chat-os-encryption-key');

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

	async function setPassphrase() {
		const passphrase = prompt(
			'Enter passphrase\n(This will be encrypted and stored in this browser, please do not forget it.)'
		);

		if (passphrase) {
			const passphraseConfirmation = prompt('Enter passphrase again to confirm.');

			if (passphrase !== passphraseConfirmation) {
				alert('Passphrases do not match, please try again');
				return;
			}

			const start = performance.now();
			const key = encodeBase64(
				await pbkdf2Async(sha256, passphrase, $user?.uid || 'chatos-salt', { c: 300000, dkLen: 32 })
			);
			const end = performance.now();

			console.log(`PBKDF2 encryption took ${end - start} milliseconds.`);
			// console.log({ key, passphrase });

			localStorage.setItem('chat-os-encryption-key', key);

			alert('Passphrase set successfully. Your chat messages from now on are encrypted 🔐');
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
	<button class="btn btn-sm btn-secondary" on:click={setPassphrase}>Set passphrase</button>
	<button class="btn btn-sm btn-secondary" on:click={showEncryptionKey}>Show encryption key</button>
	<button class="btn btn-sm btn-default" on:click={signOut}>Sign out</button>
{:else}
	<p>Not logged in</p>
	<button class="btn btn-sm btn-secondary" on:click={signIn}>Sign in with Google</button>
{/if}
