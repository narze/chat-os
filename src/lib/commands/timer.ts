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

		console.log(args);

		if (!args.minutes) {
			args.minutes = '0';
		}

		const seconds = +args.minutes * 60 + +args.seconds;

		reply({
			type: 'component',
			message: 'timer',
			options: { seconds }
		});
	}
};

export default function () {
	register(command);
	return () => deregister(command);
}
