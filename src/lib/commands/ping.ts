import register, { type Command, deregister } from '.';

const command: Command = {
	match: /^ping$/i,
	action: ({ reply }) => {
		reply('pong!');
	}
};

export default function () {
	register(command);
	return () => deregister(command);
}
