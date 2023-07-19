import { expect, test } from '@playwright/test';
import ChatOSPage from '~/tests/helpers/chat-os-page';

test('login', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('login');

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(/Sign in/i, true);
});
