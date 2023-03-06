export default class ChatMessageEvent extends Event {
	public data;

	constructor(
		eventName: string,
		eventData: {
			message: string;
			botMessageCallback: (message: string, type?: string) => void;
			botCommandCallback: (command: string) => void;
		}
	) {
		super(eventName);
		this.data = eventData;
	}
}
