import register, { type Command } from '.';
import QRCode from 'qrcode';

const command: Command = {
	match: /^qr(\s+(\S+))?/i,
	action: async ({ reply, args }) => {
		if (!args[1]) {
			reply('Please enter text after "qr" to generate a QR code');
			reply('qr [message]');
			return;
		}

		// TODO: Return HTML or Web component for easier customization

		reply({
			type: 'image',
			message: await QRCode.toDataURL(args[1], { scale: 6 }),
			options: { alt: args[1] }
		});
	}
};

export default function () {
	register(command);
}
