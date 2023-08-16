import { expect, test } from '@playwright/test';
import ChatOSPage from '~/tests/helpers/chat-os-page';

test('Copy text', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('copy me');

	await chatOS.waitForResponse();

	const messageOption = await page.locator(".message-option:near(:text('copy me'))");

	await messageOption.click();

	await messageOption.locator(":text('Copy')").click();

	await expect(page.locator(":text('Copied')")).toBeVisible();
});
