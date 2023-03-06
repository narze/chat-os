export default class ChatMessageEvent extends Event {
	public data;

	constructor(eventName: string, eventData: { message: string }) {
		super(eventName);
		this.data = eventData;
	}
}
