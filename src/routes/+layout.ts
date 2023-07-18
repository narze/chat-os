import { userStore } from '../lib/firebase-store';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async (event) => {
	const user = userStore();

	return {
		user
	};
};
