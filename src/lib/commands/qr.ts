import QRCode from 'qrcode';

import register, { type Command, deregister } from '.';

const command: Command = {
	match: /^qr(\s+(\S+))?/i,
	action: async ({ reply, args }) => {
		if (!Array.isArray(args)) return;

		if (!args[1]) {
			reply('Please enter text after "qr" to generate a QR code');
			setTimeout(() => {
				reply('qr [message]');
			}, 50);

			return;
		}

		// TODO: Return HTML or Web component for easier customization

		reply({
			type: 'image',
			message: await QRCode.toDataURL(args[1], { scale: 6 }),
			options: { alt: args[1] },
			encrypted: true
		});
	}
};

export default function () {
	register(command);

	return () => deregister(command);
}
