import { expect, test } from '@playwright/test';
import ChatOSPage from '~/tests/helpers/chat-os-page';

test('ChatOS Greeting', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectLastMessage(`Hello! I'm ChatOS! How can I help?`);
});

test('hi', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectLastMessage(`Hello! I'm ChatOS! How can I help?`);

	await chatOS.input('hi');
	await chatOS.expectLastMessage(`hi`);

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(`Hello!`);
});

test('ping', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectLastMessage(`Hello! I'm ChatOS! How can I help?`);

	await chatOS.input('ping');

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(`pong!`);
});

test('slow ping', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectLastMessage(`Hello! I'm ChatOS! How can I help?`);

	await chatOS.input('slowping');

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(`.......(a very late) pong!`);
});

test('unknown command', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectLastMessage(`Hello! I'm ChatOS! How can I help?`);

	await chatOS.input('bruh');
	await chatOS.expectLastMessage(`bruh`);

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(/Sorry I don't understand/);
});

test('commands', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectLastMessage(`Hello! I'm ChatOS! How can I help?`);

	await chatOS.input('commands');
	await chatOS.expectLastMessage(`commands`);

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(
		/Here are the commands I can do: ping, commands, qr, about, clear/
	);
});

test('clear', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectLastMessage(`Hello! I'm ChatOS! How can I help?`);

	await chatOS.input('clear');

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage('(messages cleared)');
	await expect(await chatOS.getChatLogs()).toHaveLength(1);
});

test.skip('about', async ({ page }) => {
	// TODO
});

test.skip('qr', async ({ page }) => {
	// TODO
});
