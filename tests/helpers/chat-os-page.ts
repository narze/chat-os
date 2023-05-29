import { expect, type Page } from '@playwright/test';

export default class ChatOSPage {
	page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async goto() {
		await this.page.goto('/');

		const dbReady = this.page.locator('[data-db-ready=true]');
		await dbReady.waitFor();
	}

	async input(text: string) {
		await this.page.getByRole('textbox').fill(text);
		await this.page.keyboard.press('Enter');
	}

	async getChatLogs() {
		// Wait for a little bit to fix flaky tests
		await this.page.waitForTimeout(100);

		return await this.page.getByRole('log').allInnerTexts();
	}

	async waitForResponse() {
		await this.page.waitForSelector('.chat:last-child:not(.chat-self)');
	}

	async expectLastMessage(message: string | RegExp) {
		const logs = await this.getChatLogs();

		if (typeof message === 'string') {
			await expect(logs[logs.length - 1]).toContain(message);
		} else {
			await expect(logs[logs.length - 1]).toMatch(message);
		}
	}

	async expectGreeting() {
		await this.expectLastMessage(`Hello! I'm ChatOS! How can I help?`);
	}

	async expectLastImage(src: string | RegExp, alt: string) {
		const logsElements = await this.page.getByRole('log').all();

		const lastLogEl = logsElements[logsElements.length - 1];

		await expect(lastLogEl.locator('img')).toHaveAttribute('src', src);
		await expect(lastLogEl.locator('img')).toHaveAttribute('alt', alt);
	}

	async expectTimestamp() {
		const timestampRegex = /\d{1,2}:\d{1,2} (AM|PM)/;
		await expect(this.page.getByText(timestampRegex)).toBeVisible();
	}
}
