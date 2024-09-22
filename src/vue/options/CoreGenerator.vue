<template>
<div class="box">

	<div class="field">... Or create a new seed file.</div>

	<div class="field">
		<label class="label">Type in your password:</label>
		<div class="control">
			<input class="input" type="password" v-model="password" />
		</div>
	</div>

	<div class="field">
		<label class="label">Repeat your password:</label>
		<div class="control">
			<input class="input" type="password" v-model="password2" />
		</div>
	</div>

	<div class="field">
		<button class="button is-primary" @click="create" :disabled="!can_create">Create</button>
	</div>

	<div v-if="result" class="field">
		<textarea 
			class="textarea"
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