import register, { type Command, deregister } from '.';

const command: Command = {
	match: /.?/i,
	action: ({ reply }) => {
		reply(`Sorry I don't understand... (Type "commands" to see what I can do)`);
	}
};

export default function () {
	register(command);
	return () => deregister(command);
}
