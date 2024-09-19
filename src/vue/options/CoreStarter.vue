<template><div>

	<form v-if="!started" @submit.prevent="start">
		<div>Start the crypto core by supplying a seed file and your password.</div>

		<div>
			<textarea 
				v-model="seedfile"
				style="width:50vw; height: 20em;"
			></textarea>
		</div>

		<div>
			Seed file:
			<input type="file" @change="read_file"/>
		</div>

		<div>
			Your password:
			<input type="password" v-model="password"/>
		</div>

		<div>
			<button type="submit">Start the core</button>
		</div>
	</form>

	<div v-else>



	</div>


</div></template>
<script>
import { open_seedfile } from "app/crypto/seedfile";


function readfile(event) {
  	let input = event.target;
  	let reader = new FileReader();
  	return new Promise((resolve, reject)=>{
	  	reader.onload = function() {
	    	resolve(reader.result);
	  	};
	  	reader.onerror=reject;
	  	reader.readAsText(input.files[0]);
 	});
}


export default {
	data(){ return {
		seedfile: "",
		password: "",
		core: null,

		/// #if DEV
		password: "123456",
		/// #endif
	}},

	computed: {
		started(){
			return this.core != null;
		}
	},

	watch: {
		started(){
			this.$emit("started", this.started);
		}
	},

	methods: {
		async read_file(e){
			this.seedfile = await readfile(e);
		},

		async start(){
			try{
				this.core = await open_seedfile(this.password, this.seedfile);
				this.password = "";
			} catch(e){
				console.error(e);
				alert("Cannot open seedfile. Bad password?");
			}
		}
	}
}
</script>