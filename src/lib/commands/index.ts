import type { SvelteComponent } from 'svelte';

import ChatMessageEvent from '../ChatMessageEvent';

export const eventTarget = new EventTarget();

export interface Command {
	match: string | RegExp;
	action: Action;
}

export type Components = Record<string, typeof SvelteComponent<any>>;

export type Message = string | MessageObject;
export interface MessageObject {
	message: string;
	type: string;
	options?: Record<string, any>;
	encrypted?: boolean;
}

export type Action = ({
	reply,
	args
}: {
	reply: (message: Message) => void;
	args: string[] | Record<string, string>;
}) => void;

const handlers: Record<string, (e: ChatMessageEvent) => void> = {};

export default function register(command: Command) {
	handlers[command.match.toString()] = function (e: ChatMessageEvent) {
		const match = typeof command.match === 'string' ? command.match : command.match.source;
		let matches: RegExpMatchArray | null = null;

		if (e.data.message === match || (matches = e.data.message.match(command.match))) {
			e.stopImmediatePropagation();

			const replyCallback = (message: Message) => {
				const { botMessageCallback } = e.data;
				if (typeof message === 'string') {
					botMessageCallback(message);
				} else {
					const { message: messageStr, ...payload } = message;
					botMessageCallback(messageStr, payload);
				}
			};

			const args = matches ? matches.groups || matches.slice(1) : [];

			command.action({ reply: replyCallback, args });
		}
	};

	eventTarget.addEventListener('message', handlers[command.match.toString()] as EventListener);
}

export function deregister(command: Command) {
	eventTarget.removeEventListener('message', handlers[command.match.toString()] as EventListener);
}

export type BotMessageCallback = (
	botMsg: string,
	payload?: { type: string; options?: Record<string, any>; encrypted?: boolean }
) => void;

export type BotCommandCallback = (command: string) => void;

export function handleMessage(
	message: string,
	botMessageCallback: BotMessageCallback,
	botCommandCallback: BotCommandCallback
) {
	eventTarget.dispatchEvent(
		new ChatMessageEvent('message', { message, botMessageCallback, botCommandCallback })
	);
}
