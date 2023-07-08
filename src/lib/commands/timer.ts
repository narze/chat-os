import register, { deregister, type Command } from '.';
import QRCode from 'qrcode';
import ppqr from 'promptpay-qr';

const command: Command = {
	match: /^timer(\s+((?<minutes>\d+):)?(?<seconds>\d+)?)?/i,

	action: async ({ reply, args }) => {
		if (Array.isArray(args)) return;

		if (!args.minutes && !args.seconds) {
			reply('Usage: timer mm:ss');
			return;
		}

		if (!args.minutes && args.seconds) {
			reply(`${+args.seconds} seconds`);
			return;
		}

		const seconds = +args.minutes * 60 + +args.seconds;
		reply(`${seconds} seconds`);

		// let alt = args[1];

		// if (args[3]) {
		// 	alt += ` ${args[3]}`;
		// }

		// reply({
		// 	type: 'image',
		// 	message: await QRCode.toDataURL(ppqr(args[1], { amount: args[3] ? +args[3] : undefined }), {
		// 		scale: 6
		// 	}),
		// 	options: { alt }
		// });
	}
};

export default function () {
	register(command);
	return () => deregister(command);
}
