// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

declare module 'fitty/dist/fitty.min.js' {
	export interface FittyOptions {
		minSize?: number;
		maxSize?: number;
		multiLine?: boolean;
		observeMutations?: MutationObserverInit;
	}

	function fitty(el: HTMLElement, options?: FittyOptions): FittyInstance;
	function fitty(el: string, options?: FittyOptions): FittyInstance[];
	export default fitty;

	export interface FittyInstance {
		element: HTMLElement;
		fit: () => void;
		freeze: () => void;
		unfreeze: () => void;
		unsubscribe: () => void;
	}
}

// export {};
