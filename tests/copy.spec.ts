import { test } from '@playwright/test';
import ChatOSPage from '~/tests/helpers/chat-os-page';

// TODO: test copying text
test.skip('Copy text', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('copy me');

	await chatOS.waitForResponse();
});
