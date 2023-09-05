import type { User } from 'firebase/auth';
import {
	type DocumentData,
	type QueryDocumentSnapshot,
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	limit,
	onSnapshot,
	orderBy,
	query,
	startAfter
} from 'firebase/firestore';
import { writable } from 'svelte/store';
import type { Log } from '~/src/routes/+page.svelte';

import { firestore } from '../firebase';

const CHAT_MESSAGES_INITIAL_LIMIT = 15;

export const firebaseChatMessages = writable<Log[]>();

async function loadLatestMessages(user: User) {
	const recentMessagesQuery = query(
		collection(firestore, `users/${user.uid}/messages`),
		orderBy('time', 'desc'),
		limit(CHAT_MESSAGES_INITIAL_LIMIT)
	);

	const querySnapshot = await getDocs(recentMessagesQuery);

	firebaseChatMessages.set(
		querySnapshot.docs
			.map((doc) => {
				return {
					...(doc.data() as Log),
					id: doc.id
				};
			})
			.reverse()
	);

	const newestDoc = querySnapshot.docs[0];
	const oldestDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

	return { newestDoc, oldestDoc };
}

function listenToNewMessages(
	user: User,
	newestDoc: QueryDocumentSnapshot<DocumentData, DocumentData>
) {
	const queryOptions = newestDoc ? [orderBy('time'), startAfter(newestDoc)] : [orderBy('time')];

	const newMessagesQuery = query(
		collection(firestore, `users/${user.uid}/messages`),
		...queryOptions
	);

	const processedNewMessageIds = new Set();

	onSnapshot(newMessagesQuery, (snapshot) => {
		let newMessages: Log[] = [];

		snapshot.docs.forEach((s) => {
			if (!processedNewMessageIds.has(s.id)) {
				processedNewMessageIds.add(s.id);
				newMessages.push({ ...(s.data() as Log), id: s.id });
			}
		});

		firebaseChatMessages.update((existingMessages) => [...existingMessages, ...newMessages]);
	});
}

// TODO: implement
function loadMoreOlderMessages(count: number) {}

export async function loadMessages(user: User) {
	const { newestDoc, oldestDoc } = await loadLatestMessages(user);

	listenToNewMessages(user, newestDoc);
}

export async function addMessage(user: User, doc: any) {
	return await addDoc(collection(firestore, `users/${user.uid}/messages`), doc);
}

export async function deleteMessage(user: User, docId: string) {
	firebaseChatMessages.update((existingMessages) =>
		existingMessages.filter((message) => message.id !== docId)
	);

	await deleteDoc(doc(firestore, `users/${user.uid}/messages/${docId}`));
}
