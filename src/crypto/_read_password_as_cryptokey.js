const subtle = window.crypto.subtle;

export default async function(password){
	const enc = new TextEncoder();
	const bytes = enc.encode(password);

	return subtle.importKey(
		'raw',
		bytes,
		'PBKDF2',
		false,
		['deriveKey', 'deriveBits']
	);
}