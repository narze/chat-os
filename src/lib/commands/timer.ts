import register, { deregister, type Command } from '.';

const command: Command = {
	match: /^timer(\s+((?<minutes>\d+):)?(?<seconds>\d+)?)?(\s+(?<name>.+))?/i,

	action: async ({ reply, args }) => {
		if (Array.isArray(args)) return;

		if (!+args.minutes && !+args.seconds) {
			reply('Usage: timer mm:ss');
			return;
		}

		if (!args.minutes) {
			args.minutes = '0';
		}

		const seconds = +args.minutes * 60 + +args.seconds;

		reply({
			type: 'component',
			message: 'timer',
			options: { seconds, startAt: Date.now(), name: args.name }
		});
	}
};

export default function () {
	register(command);
	return () => deregister(command);
}
