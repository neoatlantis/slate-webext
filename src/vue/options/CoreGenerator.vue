<template>
<div>

	<div>Create a new seed file.</div>

	<input type="password" v-model="password" />

	<button @click="create">Create</button>




</div>
</template>
<script>
import read_password_and_stretch from "app/crypto/read_password_and_stretch";


export default {
	data(){ return {
		password: "",
	}},

	methods: {
		async create(){
			let salt = new Uint8Array(16);
			let key = await read_password_and_stretch(this.password, salt);
			console.log(key);
		}
	}
}
</script>