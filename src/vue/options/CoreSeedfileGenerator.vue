<template>
<div class="">

	<div class="mb-1">... Or create a new seed file.</div>

	<div class="mb-1 input-group-sm input-group">
		<span class="input-group-text bg-white">Your password:</span>
		<input class="form-control" type="password" v-model="password" />
	</div>

	<div class="mb-1 input-group-sm input-group">
		<span class="input-group-text bg-white">Repeat password:</span>
		<input class="form-control" type="password" v-model="password2" />
	</div>

	<div class="mb-1 input-group-sm input-group">
		<button class="btn btn-primary" @click="create" :disabled="!can_create">Create</button>
	</div>

	<div v-if="result" class="mb-1 input-group-sm input-group">
		<textarea 
			class="form-control form-control-sm"
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