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

// Firestore

import {
	type Firestore,
	type Query,
	type CollectionReference,
	collection,
	onSnapshot,
	addDoc,
	type DocumentData
} from 'firebase/firestore';

export function collectionStore<T>(
	firestore: Firestore,
	ref: string | Query | CollectionReference,
	startWith?: T[]
) {
	let unsubscribe: () => void;

	const colRef =
		typeof ref === 'string'
			? collection(firestore, ref)
			: (ref as CollectionReference<DocumentData, DocumentData>);

	function add(data: Omit<T, 'id'>) {
		return addDoc(colRef, data as DocumentData);
	}

	// Fallback for SSR
	if (!firestore || !globalThis.window) {
		console.warn('Firestore is not initialized or not in browser');
		const { subscribe } = writable(startWith);
		return {
			subscribe,
			ref: colRef,
			add
		};
	}

	const { subscribe } = writable<T[] | undefined>(startWith, (set) => {
		unsubscribe = onSnapshot(colRef, (snapshot) => {
			const data = snapshot.docs.map((s) => {
				return { id: s.id, ref: s.ref, ...s.data() } as T;
			});

			set(data);
		});

		return () => unsubscribe();
	});

	return {
		subscribe,
		ref: colRef,
		add
	};
}
