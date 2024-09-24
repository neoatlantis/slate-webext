<template><div>

	<form v-if="!started" @submit.prevent="start" class="box">
		<div class="field">
			Start the crypto core by supplying a seed file and your password.
		</div>

		<div class="field">
			<textarea
				class="textarea"
				v-model="seedfile"
				style="width:50vw; height: 10em;"
			></textarea>
		</div>

		<div class="field">
			<label class="label">Or select a file:</label>
			<div class="file">
				<label class="file-label">
	    			<input class="file-input" type="file" @change="read_file"/>
	    			<span class="file-cta">
	      				<span class="file-icon">
	        				<i class="fas fa-upload"></i>
	      				</span>
	      				<span class="file-label"> Choose a file… </span>
	    			</span>
	  			</label>
			</div>
		</div>

		<div class="field">
			<label class="label">Your password:</label>
			<div class="control">
				<input class="input" type="password" v-model="password"/>
			</div>
		</div>

		<div class="field">
			<button class="button is-primary" type="submit">Start the core</button>
		</div>
	</form>

	
	<div class="box" v-else>
		<div class="field">
			Slate ready to use.
			<a href="#" @click.prevnet="stop">Restart</a>
		</div>

		<div class="field columns is-centered">
			<div class="column">
				<EmojiChar v-for="v in coretest_human" :number="v"></EmojiChar>
			</div>
		</div>

		<div class="field">
			<label class="label">Current domain:</label>
			<div class="control">
				<input class="input is-family-monospace" type="text" v-model="current_domain" readonly>
			</div>
		</div>

		<div class="field">
			<label class="label">
				Password Request URL:
				<a href="#" @click.prevent="on_create">Generate</a>
			</label>
			<div class="control">
				<input class="input is-family-monospace" type="text" v-model="derive_from_url" placeholder="psm-pwdgen://">
			</div>
		</div>


		<div class="field has-addons">
			<div class="control">
				<button class="button">Length:</button>
			</div>

			<div class="control is-fullwidth">
				<input class="input is-family-monospace" type="number" v-model="derive_option_length" min="6" max="256"/>
			</div>
		
			
		</div>
		<div class="field has-addons is-expanded">
			<div class="control">
				<button class="button" :class="{'is-primary':derive_option_upper}" @click="derive_option_upper=!derive_option_upper">Upper</button>
			</div>
			<div class="control">
				<button class="button" :class="{'is-primary':derive_option_lower}" @click="derive_option_lower=!derive_option_lower">Lower</button>
			</div>
			<div class="control">
				<button class="button" :class="{'is-primary':derive_option_number}" @click="derive_option_number=!derive_option_number">Num</button>
			</div>
			<div class="control">
				<button class="button" :class="{'is-primary':derive_option_special}" @click="derive_option_special=!derive_option_special">Spec</button>
			</div>
		</div>

		<div class="field">
			<button
				class="button is-primary" @click="on_derive"
				:disabled="
					!current_domain_matched
				"
			>Derive</button>
		</div>

		<div style="color:red" class="field" v-if="derive_password_error || !current_domain_matched">
			<span v-if="!current_domain_matched">
				Password URL not for current domain. Deriving not allowed.
			</span>
			<span>{{ derive_password_error }}</span>
		</div>
	</div>


	<div class="box" v-if="derived_password_from_url">
		<div class="field">
			<label class="label">
				Result: &nbsp;
				<a href="#" @click.prevent="reveal_derived_password=!reveal_derived_password">
					{{ reveal_derived_password ? 'Hide':'Show'}}
				</a>
			</label>
			<div class="control">
				<input class="input is-family-monospace" :type="reveal_derived_password?'text':'password'" v-model="derived_password_from_url" readonly />
			</div>
		</div>
		<div class="field">
			<div class="buttons">
				<button
					class="button is-primary" @click="on_result_copy"
				>Copy</button>
				<button
					class="button is-danger" @click="clear_output"
				>Clear</button>
			</div>
		</div>
	</div>

	


</div></template>
<script>
import _ from "lodash";
import url_parse from "url-parse";
import { open_seedfile } from "app/crypto/seedfile";
import EmojiChar from "./EmojiChar.vue";
const psm = require("password-security-module");

const channel_update_password = new BroadcastChannel("slate/update-password");
const channel_push_password   = new BroadcastChannel("slate/push-password");


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

function get_current_tab(){
	let queryOptions = { active: true, lastFocusedWindow: true };
    browser.tabs.query(queryOptions, ([tab]) => {
    	let url_parsed = new URL(tab.url);
    	if(
    		!url_parsed ||
    		!_.includes(["http:", "https:"], url_parsed.protocol)
    	){
    		this.current_domain = "";
    		return;
    	}
    	if(this.current_domain.toString() != url_parsed.hostname){
    		this.current_domain = url_parsed.hostname;
    	}
    });
}

var psm_instance = null;

export default {
	mounted(){
		browser.tabs.onActivated.addListener(()=>{
			get_current_tab.call(this);
		});
		browser.tabs.onUpdated.addListener(()=>{
			get_current_tab.call(this);
		});
		get_current_tab.call(this);

		channel_push_password.onmessage = (event)=>{
			this.broadcast_result();
		}
	},

	data(){ return {
		seedfile: "",
		password: "",
		core: null,
		core_test: null,

		derive_from_url: "",
		derived_password_from_url: "",
		derive_password_error: "",
		reveal_derived_password: false,

		derive_option_length: 20,
		derive_option_upper: true,
		derive_option_lower: true,
		derive_option_number: true,
		derive_option_special: false,

		current_domain: "",
		deriving_url_required_domain: "",


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

		current_domain_matched(){
			return this.deriving_url_required_domain == this.current_domain;
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

		current_domain_matched(){
			if(!this.current_domain_matched){
				this.clear_output();
			}
		},

		derive_from_url(){
			let url_p = url_parse(this.derive_from_url);
			if(!url_p || !_.startsWith(url_p.protocol, "psm-")) return;

			let qs = _.get(url_p, 'query') || "";
			let qsp = new URLSearchParams(qs);
			
			this.deriving_url_required_domain = _.get(url_p, "hostname");
			this.derive_option_length = _.parseInt(qsp.get("length"));
			this.derive_option_upper = !_.isNil(qsp.get("upper"));
			this.derive_option_lower = !_.isNil(qsp.get("lower"));
			this.derive_option_number = !_.isNil(qsp.get("number"));
			this.derive_option_special = !_.isNil(qsp.get("special"));			
		},

		derive_option_length(){ this.rewrite_derive_option() },
		derive_option_upper(){ this.rewrite_derive_option() },
		derive_option_lower(){ this.rewrite_derive_option() },
		derive_option_number(){ this.rewrite_derive_option() },
		derive_option_special(){ this.rewrite_derive_option() },

		derived_password_from_url(){ this.broadcast_result() },
	},

	methods: {
		broadcast_result(){
			channel_update_password.postMessage({
				password: this.derived_password_from_url.toString(),
				domain: this.current_domain.toString(),
			});
		},

		clear_output(){
			this.derived_password_from_url = "";
			this.derive_password_error = "";
			this.reveal_derived_password = false;
		},

		rewrite_derive_option(){
			let url_p = url_parse(this.derive_from_url);
			if(!url_p || !_.startsWith(url_p.protocol, "psm-")) return;
			this.clear_output();

			let qs = "?length=" + this.derive_option_length;
			for(let i of ["upper", "lower", "number", "special"]){
				if(!this["derive_option_"+i]) continue;
				qs += "&" + i;
			}
			
			url_p.query = qs;
			this.derive_from_url = url_p.toString();
		},

		async read_file(e){
			this.seedfile = await readfile(e);
		},

		async start(){
			try{
				let core = await open_seedfile(this.password, this.seedfile);
				const PSM = psm.init((e)=>core.digest(e));
				this.core = true;
				this.core_test = await core.digest(new Uint8Array());

				psm_instance = new PSM("default");

				this.password = "";
				this.seedfile = "";
			} catch(e){
				console.error(e);
				alert("Cannot open seedfile. Bad password?");
			}
		},

		async stop(){
			psm_instance = null;
			this.password = "";
			this.clear_output();
			this.core = null;
			this.core_test = null;
			window.reload();
		},

		async on_derive(){
			this.clear_output();
			let pwdgen = psm_instance.get_password_generator();

			let url = this.derive_from_url.toString();
			try{
				let password = await pwdgen.get_password(url);
				this.derived_password_from_url = password;
				this.broadcast_result();
			} catch(e){
				this.derive_password_error = e.message;
				this.clear_output();
			}
		},

		async on_create(){
			let pwdgen = psm_instance.get_password_generator();
			this.derive_from_url = await pwdgen.create_url(
				this.current_domain);
			this.on_derive();
		},

		async on_result_copy(){
			try{
				await navigator.clipboard.writeText(
					this.derived_password_from_url);
			} catch(e){
				alert("Failed writing password to clipboard.");
			}
		},
	},

	components: {
		EmojiChar,
	}
}
</script>