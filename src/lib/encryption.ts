import TweetNaCl from 'tweetnacl';
import TweetNaClUtil from 'tweetnacl-util';

const { secretbox, randomBytes } = TweetNaCl;
const { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } = TweetNaClUtil;

export { secretbox, randomBytes, encodeUTF8, decodeUTF8, encodeBase64, decodeBase64 };

export const encryptMessage = (json: string | Record<string, any>, key: string) => {
	const keyUint8Array = decodeBase64(key);
	const nonce = randomBytes(secretbox.nonceLength);
	const messageUint8 = decodeUTF8(JSON.stringify(json));
	const box = secretbox(messageUint8, nonce, keyUint8Array);

	const fullMessage = new Uint8Array(nonce.length + box.length);
	fullMessage.set(nonce);
	fullMessage.set(box, nonce.length);

	const base64FullMessage = encodeBase64(fullMessage);
	return base64FullMessage;
};

export const decryptMessage = (messageWithNonce: string, key: string) => {
	const keyUint8Array = decodeBase64(key);
	const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);
	const nonce = messageWithNonceAsUint8Array.slice(0, secretbox.nonceLength);
	const message = messageWithNonceAsUint8Array.slice(
		secretbox.nonceLength,
		messageWithNonce.length
	);

	const decrypted = secretbox.open(message, nonce, keyUint8Array);

	if (!decrypted) {
		throw new Error('Could not decrypt message');
	}

	const base64DecryptedMessage = encodeUTF8(decrypted);
	return JSON.parse(base64DecryptedMessage);
};
