import { type Page, expect } from '@playwright/test';

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

	async getAllChatLogs() {
		return await this.page.getByRole('log').allInnerTexts();
	}

	async getSelfChatLogs() {
		return await this.page.locator('.chat-self').getByRole('log').allInnerTexts();
	}

	async getBotChatLogs() {
		return await this.page.locator('.chat-bot').getByRole('log').allInnerTexts();
	}

	async waitForResponse() {
		await this.page.waitForSelector('.chat:last-child:not(.chat-self)');
	}

	async expectLastMessage(message: string | RegExp, bot: boolean) {
		await expect(async () => {
			const logs = await (bot ? this.getBotChatLogs() : this.getSelfChatLogs());

			if (typeof message === 'string') {
				await expect(logs[logs.length - 1]).toContain(message);
			} else {
				await expect(logs[logs.length - 1]).toMatch(message);
			}
		}).toPass();
	}

	async expectGreeting() {
		await this.expectLastMessage(`Hello! I'm ChatOS! How can I help?`, true);
	}

	async expectLastImageResponse(src: string | RegExp, alt: string) {
		await expect(async () => {
			const logsElements = await this.page.locator('.chat-bot').getByRole('log').all();

			const lastLogEl = logsElements[logsElements.length - 1];

			await expect(lastLogEl.locator('img')).toHaveAttribute('src', src);
			await expect(lastLogEl.locator('img')).toHaveAttribute('alt', alt);
		}).toPass();
	}

	async expectTimestamp() {
		const timestampRegex = /\d{1,2}:\d{1,2} (AM|PM)/;
		await expect(this.page.getByText(timestampRegex)).toBeVisible();
	}

	async login() {
		await this.input('login');

		await this.waitForResponse();
		await this.expectLastMessage(/Sign in/i, true);

		const signinPopupPromise = this.page.waitForEvent('popup');
		await this.page.click('text=Sign in with Google');

		const signinPopup = await signinPopupPromise;
		await signinPopup.waitForLoadState();

		await signinPopup.getByRole('button', { name: 'Add new account' }).click();
		await signinPopup.getByRole('button', { name: 'Auto-generate user information' }).click();
		await signinPopup.getByRole('button', { name: 'Sign in with Google.com' }).click();

		await this.expectLastMessage(/Hello/i, true);
	}
}
