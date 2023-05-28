import type ChatMessageEvent from '../ChatMessageEvent';
import { eventTarget } from '.';
import { db } from '../db';

export default function () {
	eventTarget.addEventListener('message', otherCommandsHandler as EventListener);
}

function otherCommandsHandler(e: ChatMessageEvent) {
	const message = e.data.message;
	if (message.match(/^commands$/i)) {
		e.data.botMessageCallback(
			`Here are the commands I can do: ping, commands, qr, pp, about, clear`
		);
		e.stopImmediatePropagation();
	}

	if (message == 'clear') {
		e.data.botCommandCallback('clear');
		e.data.botMessageCallback('(messages cleared)');
		e.stopImmediatePropagation();
	}
}
