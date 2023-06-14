import { expect, test } from '@playwright/test';
import ChatOSPage from '~/tests/helpers/chat-os-page';

test('ChatOS Greeting', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.expectTimestamp();
});

test('hi', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('hi');
	await chatOS.expectLastMessage(`hi`, false);

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(`Hello!`, true);
});

test('ping', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('ping');

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(`pong!`, true);
});

test('slow ping', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('slowping');

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(`.......(a very late) pong!`, true);
});

test('unknown command', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('bruh');
	await chatOS.expectLastMessage(`bruh`, false);

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(/Sorry I don't understand/, true);
});

test('commands', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('commands');
	await chatOS.expectLastMessage(`commands`, false);

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(/Here are the commands I can do: ping, commands/, true);
});

test('clear', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('clear');

	await chatOS.waitForResponse();

	await expect(async () => {
		await chatOS.expectLastMessage('(messages cleared)', true);
	}).toPass();

	await expect(await chatOS.getAllChatLogs()).toHaveLength(1);
});

test('about', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('about');

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage('https://github.com/narze/chat-os', true);
});

test('qr', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('qr');
	await chatOS.waitForResponse();
	await chatOS.expectLastMessage('qr [message]', true);

	await chatOS.input('qr https://narze.live');
	await chatOS.waitForResponse();
	await chatOS.expectLastImageResponse(/^data:image\/png;base64.+/, 'https://narze.live');
});

test('pp', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('pp');
	await chatOS.waitForResponse();
	await chatOS.expectLastMessage('pp [promptpay no.] [amount]', true);

	await chatOS.input('pp 0812345678');
	await chatOS.waitForResponse();
	await chatOS.expectLastImageResponse(/^data:image\/png;base64.+/, '0812345678');

	await chatOS.input('pp 0812345678 123.45');
	await chatOS.waitForResponse();
	await chatOS.expectLastImageResponse(/^data:image\/png;base64.+/, '0812345678 123.45');
});
