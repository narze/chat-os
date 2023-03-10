import register, { type Command } from '.';
import QRCode from 'qrcode';
import ppqr from 'promptpay-qr';

const command: Command = {
	match: /^pp(\s+(\S+))?(\s+(\S+))?/i,
	action: async ({ reply, args }) => {
		if (!args[1]) {
			reply('Please enter PromptPay number after "pp" to generate a QR code, amount is optional');
			reply('pp [promptpay no.] [amount]');
			return;
		}

		let alt = args[1];

		if (args[3]) {
			alt += ` ${args[3]}`;
		}

		reply({
			type: 'image',
			message: await QRCode.toDataURL(ppqr(args[1], { amount: args[3] ? +args[3] : undefined }), {
				scale: 6
			}),
			options: { alt }
		});
	}
};

export default function () {
	register(command);
}
