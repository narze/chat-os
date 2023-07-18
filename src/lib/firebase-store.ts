import { writable } from 'svelte/store';
import { auth } from './firebase';
import type { User } from 'firebase/auth';

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
