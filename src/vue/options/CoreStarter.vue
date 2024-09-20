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


		<div>
			Derive password from URL:
			<input type="text" v-model="derive_from_url"/>
			<input type="text" v-model="derived_password_from_url" readonly />
			<button @click="on_derive">Derive</button>
			<span style="color:red" v-if="derive_password_error">{{ derive_password_error }}</span>
		</div>


		<div>
			Generate new password:
			<input type="text" v-model="create_password_for_domain" placeholder="Domain name"/>
			<input type="text" v-model="created_url" readonly />
			<button @click="on_create">Create</button>
		</div>

	</div>


</div></template>
<script>
import { open_seedfile } from "app/crypto/seedfile";
const psm = require("app/psm/psm.js");


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

var psm_instance = null;

export default {
	data(){ return {
		seedfile: "",
		password: "",
		core: null,

		derive_from_url: "",
		derived_password_from_url: "",
		derive_password_error: "",

		create_password_for_domain: "",
		created_url: "",


		/// #if DEV
		password: "123456",
		derive_from_url: "psm-pwdgen://google.com/6792ea41f275ca36670efdc878d3cbae14fdbf8518d3c83e554f?length=40&upper",
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
				
				let core = await open_seedfile(this.password, this.seedfile);
				const PSM = psm.init((e)=>core.digest(e));
				this.core = true;

				psm_instance = new PSM("default");


				this.password = "";
			} catch(e){
				console.error(e);
				alert("Cannot open seedfile. Bad password?");
			}
		},

		async on_derive(){
			this.derive_password_error = "";
			let pwdgen = psm_instance.get_password_generator();

			let url = this.derive_from_url.toString();
			try{
				let password = await pwdgen.get_password(url);
				this.derived_password_from_url = password;
			} catch(e){
				this.derive_password_error = e.message;
			}
		},

		async on_create(){
			let pwdgen = psm_instance.get_password_generator();
			this.created_url = await pwdgen.create_url(this.create_password_for_domain);

			console.log(await pwdgen.get_password(this.created_url + "&upper"));
		}
	}
}
</script>