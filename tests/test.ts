import { expect, test, type Page } from '@playwright/test';

test('ChatOS Greeting', async ({ page }) => {
	await page.goto('/');

	await expect(await getChatLogs(page)).toContain(`Hello! I'm ChatOS! How can I help?`);
});

test('hi', async ({ page }) => {
	await page.goto('/');

	await expect(await getChatLogs(page)).toContain(`Hello! I'm ChatOS! How can I help?`);

	await page.getByRole('textbox').fill('hi');
	await page.keyboard.press('Enter');

	await expect(await getChatLogs(page)).toContain(`hi`);

	// FIXME: Wait for bot's latest message rather than fixed time
	await new Promise((resolve) => setTimeout(resolve, 110));

	await expect(await getChatLogs(page)).toContain(`Hello!`);
});

async function getChatLogs(page: Page) {
	return await page.getByRole('log').allInnerTexts();
}
