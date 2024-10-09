function json2buffer(json){
	let data = JSON.stringify(json);
	let encoder = new TextEncoder();
	return encoder.encode(data);
}

function buffer2json(buffer){
	let decoder = new TextDecoder();
	let string = decoder.decode(buffer);
	return JSON.parse(buffer);
}

export { json2buffer, buffer2json };