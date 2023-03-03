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

test('unknown command', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectLastMessage(`Hello! I'm ChatOS! How can I help?`);

	await chatOS.input('bruh');
	await chatOS.expectLastMessage(`bruh`);

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(/Sorry I don't understand/);
});

test.skip('commands', async ({ page }) => {
	// TODO
});

test.skip('about', async ({ page }) => {
	// TODO
});

test.skip('clear', async ({ page }) => {
	// TODO
});

test.skip('qr', async ({ page }) => {
	// TODO
});
