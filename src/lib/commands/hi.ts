import register, { deregister, type Command } from '.';

const command: Command = {
	match: 'hi',
	action: ({ reply }) => {
		reply('Hello!');
	}
};

export default function () {
	register(command);

	return () => deregister(command);
}
