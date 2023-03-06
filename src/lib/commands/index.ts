import ChatMessageEvent from '../ChatMessageEvent';

export const eventTarget = new EventTarget();

export interface Command {
	match: string | RegExp;
	action: Action;
}

export type Action = ({
	reply,
	args
}: {
	reply: (
		message: string | { message: string; type: string; options: Record<string, any> }
	) => void;
	args: string[];
}) => void;

const handlers: Record<string, (e: ChatMessageEvent) => void> = {};

export default function register(command: Command) {
	handlers[command.match.toString()] = function (e: ChatMessageEvent) {
		const match = typeof command.match === 'string' ? command.match : command.match.source;
		let matches: RegExpMatchArray | null = null;

		if (e.data.message === match || (matches = e.data.message.match(command.match))) {
			e.stopImmediatePropagation();

			const replyCallback = (
				message: string | { message: string; type: string; options: Record<string, any> }
			) => {
				const { botMessageCallback } = e.data;
				if (typeof message === 'string') {
					botMessageCallback(message);
				} else {
					botMessageCallback(message.message, message.type, message.options);
				}
			};

			const args = !!matches ? matches.slice(1) : [];

			command.action({ reply: replyCallback, args });
		}
	};

	eventTarget.addEventListener('message', handlers[command.match.toString()] as EventListener);
}

export function handleMessage(
	message: string,
	botMessageCallback: (botMsg: string, type?: string, options?: Record<string, any>) => void,
	botCommandCallback: (command: string) => void
) {
	eventTarget.dispatchEvent(
		new ChatMessageEvent('message', { message, botMessageCallback, botCommandCallback })
	);
}
