import register, { type Command, deregister } from '.';

const command: Command = {
	match: /^slowping$/i,
	action: ({ reply }) => {
		setTimeout(() => {
			reply('.......(a very late) pong!');
		}, 3000);
	}
};

export default function () {
	register(command);
	return () => deregister(command);
}
