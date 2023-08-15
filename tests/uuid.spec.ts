import { test } from '@playwright/test';
import ChatOSPage from '~/tests/helpers/chat-os-page';

test('uuid command', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('uuid');

	await chatOS.waitForResponse();

	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

	await chatOS.expectLastMessage(uuidRegex, true);
});
