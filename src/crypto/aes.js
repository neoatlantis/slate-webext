const msgpack = require('@ygoe/msgpack');
const subtle = window.crypto.subtle;


async function encrypt(key, data){
	const sha256 = await subtle.digest('SHA-256', data);

	const iv = window.crypto.getRandomValues(new Uint8Array(16));
	const params = { name: 'AES-CBC', iv };

	const plaintext_with_digest = msgpack.serialize([sha256, data]);

	let encrypted = new Uint8Array(
		await subtle.encrypt(params, key, plaintext_with_digest)
	);
	return msgpack.serialize([iv, encrypted]);
}

export { encrypt }