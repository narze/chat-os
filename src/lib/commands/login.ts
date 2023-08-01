import register, { type Command, type Components, deregister } from '.';
import Login from './components/Login.svelte';

const command: Command = {
	match: /^login$/i,

	action: async ({ reply, args }) => {
		reply({
			type: 'component',
			message: 'login'
			// options: { seconds, startAt: Date.now(), name: args.name }
		});
	}
};

export const components: Components = { login: Login };

export default function () {
	register(command);
	return () => deregister(command);
}
