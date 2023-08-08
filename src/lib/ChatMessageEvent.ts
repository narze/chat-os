import type { BotCommandCallback, BotMessageCallback } from './commands';

export default class ChatMessageEvent extends Event {
	public data;

	constructor(
		eventName: string,
		eventData: {
			message: string;
			botMessageCallback: BotMessageCallback;
			botCommandCallback: BotCommandCallback;
		}
	) {
		super(eventName);
		this.data = eventData;
	}
}
