<template>
<div>

	<div>Create a new seed file.</div>

	<div>Type in your password: <input type="password" v-model="password" /></div>
	<div>Repeat your password: <input type="password" v-model="password2" /></div>

	<button @click="create" :disabled="!can_create">Create</button>

	<div v-if="result">
		<textarea 
			readonly
			v-model="result"
			style="width:50vw; height: 20em;"
		></textarea>
	</div>



</div>
</template>
<script>
import { create_seedfile } from "app/crypto/seedfile.js";


export default {
	data(){ return {
		password: "",
		password2: "",
		result: "",
	}},

	methods: {
		async create(){
			let seedfile = await create_seedfile(this.password);
			this.result = seedfile;
			this.password = "";
			this.password2 = "";
		}
	},

	computed: {
		can_create(){
			return (
				this.password == this.password2 &&
				this.password.length > 5
			);
		}
	}
}
</script>