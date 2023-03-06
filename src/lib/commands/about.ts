import register, { type Command } from '.';

const command: Command = {
	match: 'about',
	action: ({ reply }) => {
		reply('This is a demo of the ChatOS project. Check out the source code on GitHub!');
		reply({ message: 'https://github.com/narze/chat-os', type: 'link' });
	}
};

export default function () {
	register(command);
}
