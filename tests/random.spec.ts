import { test } from '@playwright/test';
import ChatOSPage from '~/tests/helpers/chat-os-page';

test('random command returns Math.random()', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('random');

	await chatOS.waitForResponse();

	const randomNumberRegex = /0\.[0-9]+$/i;

	await chatOS.expectLastMessage(randomNumberRegex, true);
});

test('random command with number returns random value upto that number', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('random 5');

	await chatOS.waitForResponse();

	const randomNumberRegex = /^[0-4]$/i;

	await chatOS.expectLastMessage(randomNumberRegex, true);
});
