import { expect, test } from '@playwright/test';

test('ChatOS Greeting', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('log')).toHaveText(`Hello! I'm ChatOS! How can I help?`);
});
