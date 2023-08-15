import { v4 } from 'uuid';

import register, { type Command, deregister } from '.';

const command: Command = {
	match: /^uuid$/i,
	action: ({ reply }) => {
		reply(v4());
	}
};

export default function () {
	register(command);
	return () => deregister(command);
}
