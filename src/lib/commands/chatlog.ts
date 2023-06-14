import register, { deregister, type Command } from '.';
import { db } from '../db';

const command: Command = {
	match: 'chatlog',
	action: async ({ reply }) => {
		const logs = await db.chatLogs.toArray();

		const lines = logs.map((log) => {
			return `${log.isBot ? 'Bot' : 'User'} @ ${log.time.toLocaleString('en-US', {
				weekday: 'short',
				hour: 'numeric',
				minute: 'numeric',
				second: 'numeric',
				hour12: true
			})}: ${log.message}`;
		});

		reply('(wip) Here are the chat logs:');

		reply(lines.join('\n'));
	}
};

export default function () {
	register(command);

	return () => deregister(command);
}
