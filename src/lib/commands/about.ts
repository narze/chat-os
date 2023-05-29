import register, { deregister, type Command } from '.';

const command: Command = {
	match: 'about',
	action: ({ reply }) => {
		reply('This is a demo of the ChatOS project. Check out the source code on GitHub!');
		reply({ message: 'https://github.com/narze/chat-os', type: 'link' });
		setTimeout(() => {
			reply('Project Backlog:');
			reply({ message: 'https://github.com/users/narze/projects/3', type: 'link' });
		}, 500);
	}
};

export default function () {
	register(command);
	return () => deregister(command);
}
