import { ENCRYPTION_KEY } from '$env/static/private';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// encrypt a token
export function encryptToken(token: string): string {
	// For AES, this is always 16
	const iv = randomBytes(16);
	const cipher = createCipheriv(
		'aes-256-cbc',
		new Uint8Array(Buffer.from(ENCRYPTION_KEY)),
		new Uint8Array(iv),
	);
	let encrypted = cipher.update(token);
	encrypted = Buffer.concat([new Uint8Array(encrypted), new Uint8Array(cipher.final())]);
	return iv.toString('hex') + '-' + encrypted.toString('hex');
}

// Function to decrypt a token
export function decryptToken(encryptedToken: string): string {
	const textParts = encryptedToken.split('-');
	const iv = Buffer.from(textParts.shift()!, 'hex');
	const encryptedText = Buffer.from(textParts.join('-'), 'hex');
	const decipher = createDecipheriv(
		'aes-256-cbc',
		new Uint8Array(Buffer.from(ENCRYPTION_KEY)),
		new Uint8Array(iv),
	);
	let decrypted = decipher.update(new Uint8Array(encryptedText));
	decrypted = Buffer.concat([new Uint8Array(decrypted), new Uint8Array(decipher.final())]);
	return decrypted.toString();
}
