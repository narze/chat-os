import register, { type Command } from '.';

const command: Command = {
	match: 'hi',
	action: ({ reply }) => {
		reply('Hello!');
	}
};

export default function () {
	register(command);
}
