import { type Dialog, expect, test } from '@playwright/test';
import ChatOSPage from '~/tests/helpers/chat-os-page';

test('login and set passphrase', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();
	await chatOS.login();

	let passphraseSet = false;

	// set passphrase
	chatOS.page.on('dialog', handleLoginDialog);
	await chatOS.page.getByRole('button', { name: 'Set Passphrase' }).click();

	// wait for encryption key to be generated
	await expect(async () => {
		expect(passphraseSet).toBeTruthy();
	}).toPass();

	chatOS.page.off('dialog', handleLoginDialog);

	// show encryption key
	chatOS.page.on('dialog', handleShowEncryptionKeyDialog);
	await chatOS.page.getByRole('button', { name: 'Show Encryption Key' }).click();
	chatOS.page.off('dialog', handleShowEncryptionKeyDialog);

	async function handleLoginDialog(dialog: Dialog) {
		const message = dialog.message();
		// console.log({ message });

		switch (true) {
			case !!message.match(/Enter passphrase again/):
				await dialog.accept('p4ssw0rd');
				break;
			case !!message.match(/Enter passphrase/):
				await dialog.accept('p4ssw0rd');
				break;
			case !!message.match(/Passphrase set successfully/):
				passphraseSet = true;
				await dialog.dismiss();
				break;
			default:
				await dialog.dismiss();
		}
	}

	async function handleShowEncryptionKeyDialog(dialog: Dialog) {
		const message = dialog.message();

		expect(message, 'should not show error').not.toMatch(/Error/);

		await dialog.dismiss();
	}
});

test('login and set passphrase incorrectly', async ({ page }) => {
	const chatOS = new ChatOSPage(page);
	await chatOS.goto();
	await chatOS.login();

	// set passphrase
	chatOS.page.on('dialog', handleLoginDialog);
	await chatOS.page.getByRole('button', { name: 'Set Passphrase' }).click();
	chatOS.page.off('dialog', handleLoginDialog);

	// show encryption key
	chatOS.page.on('dialog', handleShowEncryptionKeyDialog);
	await chatOS.page.getByRole('button', { name: 'Show Encryption Key' }).click();
	chatOS.page.off('dialog', handleShowEncryptionKeyDialog);

	async function handleLoginDialog(dialog: Dialog) {
		const message = dialog.message();

		switch (true) {
			case !!message.match(/Enter passphrase again/):
				await dialog.accept('unmatched password');
				break;
			case !!message.match(/Enter passphrase/):
				await dialog.accept('p4ssw0rd');
				break;
			default:
				await dialog.dismiss();
		}
	}

	async function handleShowEncryptionKeyDialog(dialog: Dialog) {
		const message = dialog.message();

		expect(message, 'should not show error').toMatch(/Error/);

		await dialog.dismiss();
	}
});
