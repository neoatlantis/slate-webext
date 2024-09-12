<template>
<div>

	<div>Create a new seed file.</div>

	<input type="password" v-model="password" />

	<button @click="create">Create</button>




</div>
</template>
<script>
import { create_seedfile } from "app/crypto/seedfile.js";


export default {
	data(){ return {
		password: "",
	}},

	methods: {
		async create(){
			let seedfile = await create_seedfile(this.password);
			console.log(seedfile);
		}
	}
}
</script>