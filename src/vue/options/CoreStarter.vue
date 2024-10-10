<template><div>

	<form v-if="!started" @submit.prevent="start" class="box">
		<div class="mb-3">
			To start redeeming password request urls, supply a seed file and
			its corresponding password to initialize.
		</div>

		<div class="mb-1">
			<textarea
				class="form-control form-control-sm"
				v-model="seedfile"
				style="height: 10em;"
			></textarea>
		</div>

		<div class="mb-1 input-group-sm input-group">
			<span class="input-group-text bg-white">Or select a file...</span>
			<input 
				class="form-control" 
				type="file" id="formFile" @change="read_file"/>
			
		</div>

		<div class="mb-1 input-group-sm input-group">
			<span class="input-group-text bg-white">Your password:</span>
			<input class="form-control" type="password" v-model="password"/>
		</div>

		<div class="mb-1">
			<button class="btn btn-sm btn-primary" type="submit">Start the core</button>
		</div>
	</form>

	<div v-else>

		<div class="field">
            Slate ready to use. Icons below represent the loaded core, remember
            them to make sure you've got the correct seedfile.
            <a href="#" @click.prevnet="stop">Restart</a>
        </div>

		
        <div class="d-flex justify-content-center">
            <EmojiChar v-for="v in coretest_human" :number="v"></EmojiChar>
        </div>

		<PSMPwdgen></PSMPwdgen>

	</div>
	
</div></template>
<script>
import _ from "lodash";
import url_parse from "url-parse";
import { open_seedfile } from "app/crypto/seedfile";
import EmojiChar from "./EmojiChar.vue";
import PSMPwdgen from "./PSMPwdgen.vue";
import { init_with_core, destroy_core } from "./psm_instance.js";

/// #if DEV
import get_test_seed from "app/test-seedfile.js";
/// #endif



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
	mounted(){
		/// #if DEV
		setTimeout(()=>{
			console.log("Autostart");
			this.start();
		}, 100);
		/// #endif

		browser.tabs.onActivated.addListener(()=>{
			get_current_tab.call(this);
		});
		browser.tabs.onUpdated.addListener(()=>{
			get_current_tab.call(this);
		});
		get_current_tab.call(this);
	},

	data(){ return {
		seedfile: "",
		/// #if DEV
		seedfile: get_test_seed(),
		/// #endif

		password: "",
		core: null,
		core_test: null,


		/// #if DEV
		password: "123456",
		//derive_from_url: "psm-pwdgen://google.com/6792ea41f275ca36670efdc878d3cbae14fdbf8518d3c83e554f?length=40&upper",
		derive_from_url: "psm-pwdgen://google.com/b29be6d5fcd91a87ace7927583358a6bd04afed328d40e0bea47?length=20&upper",
		/// #endif
	}},

	computed: {
        started(){
            return this.core != null;
        },

        coretest_human(){
            if(!this.core_test || !this.core_test.buffer) return [];
            let u16n = new Uint16Array(this.core_test.buffer);
            let k = 0, ret = [];
            for(let i=0; i<5; i++){
                k = (k + u16n[i]) % 719;
                ret.push(k);
            }
            return ret;
        },
    },

	watch: {
		started(){
			this.$emit("started", this.started);
		},
	},

	methods: {

		clear_output(){
			this.derived_password_from_url = "";
			this.derive_password_error = "";
			this.reveal_derived_password = false;
		},

		async read_file(e){
			this.seedfile = await readfile(e);
		},

		async start(){
			try{
				let core = await open_seedfile(this.password, this.seedfile);
				await init_with_core(core);
				this.core = true;
				this.core_test = await core.digest(new Uint8Array());

				this.password = "";
				this.seedfile = "";
			} catch(e){
				console.error(e);
				alert("Cannot open seedfile. Bad password?");
			}
		},

		async stop(){
			destroy_core();
			this.password = "";
			this.clear_output();
			this.core = null;
			this.core_test = null;
			window.location.reload();
		},

	},

	components: {
		EmojiChar,
		PSMPwdgen,
	}
}
</script>