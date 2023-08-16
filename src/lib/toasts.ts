import { writable } from 'svelte/store';

interface Toast {
	message: string;
	type: 'success' | 'error' | 'warning' | 'info';
}
export const toasts = writable<Toast[]>([]);

export const addToast = (message: string, type: Toast['type'] = 'info') => {
	toasts.update((ts) => {
		ts.push({ message, type });
		return ts;
	});

	// Remote added toast after 3 seconds
	setTimeout(() => {
		toasts.update((ts) => {
			ts.pop();
			return ts;
		});
	}, 3000);
};
