import { expect, test } from '@playwright/test';
import ChatOSPage from '~/tests/helpers/chat-os-page';

test('ChatOS Greeting', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await expect(await chatOS.getChatLogs()).toContain(`Hello! I'm ChatOS! How can I help?`);
});

test('hi', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await expect(await chatOS.getChatLogs()).toContain(`Hello! I'm ChatOS! How can I help?`);

	await chatOS.input('hi');

	await expect(await chatOS.getChatLogs()).toContain(`hi`);

	await chatOS.waitForResponse();

	await expect(await chatOS.getChatLogs()).toContain(`Hello!`);
});
