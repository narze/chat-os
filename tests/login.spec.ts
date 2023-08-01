import { test } from '@playwright/test';
import ChatOSPage from '~/tests/helpers/chat-os-page';

test('login', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();

	await chatOS.expectGreeting();

	await chatOS.input('login');

	await chatOS.waitForResponse();
	await chatOS.expectLastMessage(/Sign in/i, true);

	const signinPopupPromise = chatOS.page.waitForEvent('popup');
	await chatOS.page.click('text=Sign in with Google');

	const signinPopup = await signinPopupPromise;
	await signinPopup.waitForLoadState();

	await signinPopup.getByRole('button', { name: 'Add new account' }).click();
	await signinPopup.getByRole('button', { name: 'Auto-generate user information' }).click();
	await signinPopup.getByRole('button', { name: 'Sign in with Google.com' }).click();

	await chatOS.expectLastMessage(/Hello/i, true);
});
