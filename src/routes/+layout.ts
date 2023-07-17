import { getUserAuthState } from '../lib/firebase';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async (event) => {
	const user = await getUserAuthState();

	return {
		user
	};
};
