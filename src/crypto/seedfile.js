import read_password from "./read_password_and_stretch";
import { encrypt } from "./aes";
import buffer from "buffer";

const subtle = window.crypto.subtle;

const ITERATIONS = 1048576;



async function create_seedfile(password){
	let random_bytes = window.crypto.getRandomValues(new Uint8Array(1024));

	let salt = window.crypto.getRandomValues(new Uint8Array(16));
	let encrypt_key = await read_password(password, salt, ITERATIONS);

	let seedfile_bytes = await encrypt(encrypt_key, random_bytes);
	return buffer.Buffer.from(seedfile_bytes).toString('base64');
}


export {
	create_seedfile,
}