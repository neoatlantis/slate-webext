import read_password from "./read_password_as_cryptokey";
const subtle = window.crypto.subtle;


export default async function(password, salt){

	const secret_key = await read_password(password);

	const pbkdf2params = {
		name: 'PBKDF2',
		hash: 'SHA-512',
		salt,
		iterations: 1048576,
	};

	return subtle.deriveKey(
		pbkdf2params,
		secret_key,
		{ name: 'AES-CBC', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}