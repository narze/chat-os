import register, { deregister, type Command } from '.';
import Timer from './components/timer.svelte';
const command: Command = {
	match: /^timer(\s+(\d+))/i,
	action: async ({ reply, args }) => {
		if (!args[1]) {
			reply('Please enter timer in minutes');
			reply('timer [minutes]');
			return;
		}

		const minutes = args[1];

		reply({
			type: 'component',
			message: 'timer',
			options: { minutes }
		});
	}
};

export default function () {
	register(command);
	return () => deregister(command);
}
