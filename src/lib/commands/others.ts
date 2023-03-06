import type ChatMessageEvent from '../ChatMessageEvent';
import { eventTarget } from '.';

export default function () {
	eventTarget.addEventListener('message', otherCommandsHandler as EventListener);
}

function otherCommandsHandler(e: ChatMessageEvent) {
	const message = e.data.message;
	if (message.match(/^commands$/i)) {
		e.data.botMessageCallback(`Here are the commands I can do: ping, commands, qr, about, clear`);
		e.stopImmediatePropagation();
	}

	if (message.match(/^qr/i)) {
		// If having text after space
		const matches = message.match(/^qr(\s+)(.*)$/i);
		if (matches && matches[2]) {
			const qrText = matches[2];

			// TODO: Generate base64 QR code
			e.data.botMessageCallback(
				`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrText}`,
				'image'
			);
		} else {
			e.data.botMessageCallback(`Please enter text after "qr" to generate a QR code!`);
		}
		e.stopImmediatePropagation();
	}

	if (message == 'about') {
		e.data.botMessageCallback(
			'This is a demo of the ChatOS project. Check out the source code on GitHub!'
		);
		e.data.botMessageCallback('https://github.com/narze/chat-os', 'link');
		e.stopImmediatePropagation();
	}

	if (message == 'clear') {
		e.data.botCommandCallback('clear');
		e.data.botMessageCallback('(messages cleared)');
		e.stopImmediatePropagation();
	}
}
