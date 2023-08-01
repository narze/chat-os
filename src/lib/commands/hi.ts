import register, { type Command, deregister } from '.';

const command: Command = {
	match: '^hi',
	action: ({ reply }) => {
		reply('Hello!');
	}
};

export default function () {
	register(command);

	return () => deregister(command);
}
