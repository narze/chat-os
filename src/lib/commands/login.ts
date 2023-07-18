import register, { deregister, type Command } from '.';

const command: Command = {
	match: /^login$/i,

	action: async ({ reply, args }) => {
		reply({
			type: 'text',
			message: 'TODO: login'
			// options: { seconds, startAt: Date.now(), name: args.name }
		});
	}
};

export default function () {
	register(command);
	return () => deregister(command);
}
