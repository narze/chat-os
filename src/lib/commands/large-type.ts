import register, { deregister, type Command } from '.';

const command: Command = {
	match: /^large(type)?(\s+(.+))/i,
	action: async ({ reply, args }) => {
		if (!Array.isArray(args)) return;

		if (!args[2]) {
			reply('Please enter message');
			reply('large [message]');
			return;
		}

		const text = args[2];

		reply({
			type: 'component',
			message: 'largetype',
			options: { text }
		});
	}
};

export default function () {
	register(command);
	return () => deregister(command);
}
