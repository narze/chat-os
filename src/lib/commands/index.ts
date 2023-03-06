import ChatMessageEvent from '../ChatMessageEvent';

export const eventTarget = new EventTarget();

export interface Command {
	match: string | RegExp;
	action: Action;
}

export type Action = ({ reply }: { reply: (message: string) => void }) => void;

const handlers: Record<string, (e: ChatMessageEvent) => void> = {};

export default function register(command: Command) {
	handlers[command.match.toString()] = function (e: ChatMessageEvent) {
		if (typeof command.match === 'string') {
			if (e.data.message === command.match) {
				e.stopImmediatePropagation();
				command.action({ reply: e.data.botMessageCallback });
			}
		} else {
			if (e.data.message.match(command.match)) {
				e.stopImmediatePropagation();
				command.action({ reply: e.data.botMessageCallback });
			}
		}
	};

	eventTarget.addEventListener('message', handlers[command.match.toString()] as EventListener);
}

export function handleMessage(
	message: string,
	botMessageCallback: (botMsg: string, type?: string) => void,
	botCommandCallback: (command: string) => void
) {
	eventTarget.dispatchEvent(
		new ChatMessageEvent('message', { message, botMessageCallback, botCommandCallback })
	);
}
