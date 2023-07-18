import { writable } from 'svelte/store';
import { auth } from './firebase';
import type { User } from 'firebase/auth';

/**
 * The userStore is updated whenever the authentication state changes.
 * If the authentication is not initialized or not in the browser, the store returns undefined.
 * Therefore, you could check for undefined in the component and show a loading or blank state.
 */
export function userStore() {
	// Handle SSR by returning $user as undefined, then check in the component as loading state
	if (!auth || !globalThis.window) {
		console.warn('Auth is not initialized or not in browser');
		const { subscribe } = writable<undefined>(undefined);
		return {
			subscribe
		};
	}

	const { subscribe } = writable<User | null | undefined>(auth?.currentUser ?? undefined, (set) => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			set(user);
		});

		return () => unsubscribe();
	});

	return { subscribe };
}
