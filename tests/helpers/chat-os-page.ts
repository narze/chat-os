import type { Page } from '@playwright/test';

export default class ChatOSPage {
	page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async goto() {
		await this.page.goto('/');
	}

	async input(text: string) {
		await this.page.getByRole('textbox').fill(text);
		await this.page.keyboard.press('Enter');
	}

	async getChatLogs() {
		return await this.page.getByRole('log').allInnerTexts();
	}

	async waitForResponse() {
		await this.page.waitForSelector('.chat:last-child:not(.chat-self)');
	}
}
