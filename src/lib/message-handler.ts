import ChatMessageEvent from './ChatMessageEvent';

const eventTarget = new EventTarget();

export function handleMessage(
	message: string,
	botMessageCallback: (botMsg: string, type?: string) => void,
	botCommandCallback: (command: string) => void
) {
	eventTarget.dispatchEvent(
		new ChatMessageEvent('message', { message, botMessageCallback, botCommandCallback })
	);
}

function hiHandler(e: ChatMessageEvent) {
	if (e.data.message == 'hi') {
		e.data.botMessageCallback('Hello!');
		e.stopImmediatePropagation();
	}
}

function pingHandler(e: ChatMessageEvent) {
	if (e.data.message.match(/^ping$/i)) {
		e.data.botMessageCallback('pong!');
		e.stopImmediatePropagation();
	}
}

function slowPingHandler(e: ChatMessageEvent) {
	if (e.data.message.match(/^slowping$/i)) {
		e.stopImmediatePropagation();

		setTimeout(() => {
			e.data.botMessageCallback('.......(a very late) pong!');
		}, 3000);
	}
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

function unknownCommandHandler(e: ChatMessageEvent) {
	e.data.botMessageCallback(`Sorry I don't understand... (Type "commands" to see what I can do)`);
	e.stopImmediatePropagation();
}

eventTarget.addEventListener('message', hiHandler as EventListener);
eventTarget.addEventListener('message', pingHandler as EventListener);
eventTarget.addEventListener('message', slowPingHandler as EventListener);
eventTarget.addEventListener('message', otherCommandsHandler as EventListener);
eventTarget.addEventListener('message', unknownCommandHandler as EventListener);
