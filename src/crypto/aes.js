const msgpack = require('@ygoe/msgpack');
const _ = require("lodash");
const subtle = window.crypto.subtle;
const buffer = require("buffer");


async function encrypt(key, data){
	const sha256 = new Uint8Array(await subtle.digest('SHA-256', data));

	const iv = window.crypto.getRandomValues(new Uint8Array(16));
	const params = { name: 'AES-CBC', iv };

	const plaintext_with_digest = msgpack.serialize([sha256, data]);

	let encrypted = new Uint8Array(
		await subtle.encrypt(params, key, plaintext_with_digest)
	);
	return msgpack.serialize([iv, encrypted]);
}

async function decrypt(key, data){
	let deserialized = msgpack.deserialize(data);
	let iv = _.get(deserialized, 0),
		encrypted = _.get(deserialized, 1);

	const params = { name: 'AES-CBC', iv };
	let decrypted = msgpack.deserialize(new Uint8Array(
		await subtle.decrypt(params, key, encrypted)
	));

	let sha256_got = _.get(decrypted, 0),
		plaintext = _.get(decrypted, 1);

	let sha256_found = await subtle.digest('SHA-256', plaintext);

	if(
		buffer.Buffer.from(sha256_got).toString('hex') ==
		buffer.Buffer.from(sha256_found).toString('hex')
	){
		// TODO time constant eq
		return plaintext;
	}
	throw Error("Plaintext corrupted.");
}

export { encrypt, decrypt }