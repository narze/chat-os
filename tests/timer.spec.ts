import { expect, test } from '@playwright/test';
import ChatOSPage from '~/tests/helpers/chat-os-page';

test('timer command without time', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('timer');

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(`Usage: timer mm:ss`, true);
});

test('timer 123 sets timer to 123 seconds', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('timer 123');

	await chatOS.waitForResponse();

	await chatOS.expectLastMessage(`123 seconds`, true);
});

test('timer 02:05 sets timer to 125 seconds', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('timer 02:05');

	await chatOS.waitForResponse();

	await chatOS.expectLastMessage(`125 seconds`, true);
});
