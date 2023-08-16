import { expect, test } from '@playwright/test';
import ChatOSPage from '~/tests/helpers/chat-os-page';

test('Delete guest message', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('delete me');

	await chatOS.waitForResponse();

	const messageOption = await page.locator(".message-option:near(:text('delete me'))");

	await messageOption.click();

	// Confirm dialog
	chatOS.page.on('dialog', (dialog) => dialog.accept());

	await messageOption.locator(":text('Delete')").click();

	// Expect "delete me" to be deleted
	await expect(page.locator(":text('delete me')")).not.toBeVisible();
});

test('Delete user message', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.login();

	await chatOS.input('delete me');

	await chatOS.waitForResponse();

	const messageOption = await page.locator(".message-option:near(:text('delete me'))");

	await messageOption.click();

	// Confirm dialog
	chatOS.page.on('dialog', (dialog) => dialog.accept());

	await messageOption.locator(":text('Delete')").click();

	// Expect "delete me" to be deleted
	await expect(page.locator(":text('delete me')")).not.toBeVisible();
});
