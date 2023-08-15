import register, { type Command, deregister } from '.';

const command: Command = {
	match: /^rand(om)?(\s+(\d+))?$/i,

	action: ({ reply, args }) => {
		if (!Array.isArray(args) || !args[2]) {
			const number = Math.random();
			reply(String(number));
		} else {
			const number = Math.floor(Math.random() * Number(args[1]));
			reply(String(number));
		}
	}
};

export default function () {
	register(command);
	return () => deregister(command);
}
