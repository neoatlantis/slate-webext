import read_password from "./read_password_and_stretch";
import { encrypt, decrypt } from "./aes";
import buffer from "buffer";
import msgpack from "@ygoe/msgpack";
import _ from "lodash";
import { CryptoCore, TOTAL_SEED_BYTES } from "./CryptoCore";

const subtle = window.crypto.subtle;

const ITERATIONS = 1048576;



async function create_seedfile(password){
	let random_bytes = window.crypto.getRandomValues(
		new Uint8Array(TOTAL_SEED_BYTES));

	let salt = window.crypto.getRandomValues(new Uint8Array(16));
	let encrypt_key = await read_password(password, salt, ITERATIONS);

	let seedfile_bytes = await encrypt(encrypt_key, random_bytes);
	
	let output = [
		buffer.Buffer.from(salt),
		buffer.Buffer.from(seedfile_bytes),
	];
	let b64 = buffer.Buffer.from(msgpack.serialize(output)).toString("base64");

	return `SEEDFILE<<< ${b64} <<<SEEDFILE`;
}


async function open_seedfile(password, seedfile_text){
	seedfile_text = seedfile_text.trim();

	if(
		!_.startsWith(seedfile_text, "SEEDFILE<<< ") &&
		!_.endsWith(seedfile_text, " <<<SEEDFILE")
	){
		throw Error("Not a seedfile.");
	}
	seedfile_text = seedfile_text.slice(12, -12);

	let seedfile_serialized = buffer.Buffer.from(seedfile_text, 'base64');
	let seedfile_struct = msgpack.deserialize(seedfile_serialized);

	let salt = _.get(seedfile_struct, 0),
		encrypted_bytes = _.get(seedfile_struct, 1);

	let decrypt_key = await read_password(password, salt, ITERATIONS);
	let seedfile_bytes = await decrypt(decrypt_key, encrypted_bytes);

	let core = new CryptoCore();
	await core.init(seedfile_bytes);

	return core;
}


export {
	create_seedfile,
	open_seedfile,
}