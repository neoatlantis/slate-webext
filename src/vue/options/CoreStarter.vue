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
			<label class="label">Result:</label>
			<div class="control">
				<input class="input is-family-monospace" type="text" v-model="derived_password_from_url" readonly />
			</div>
		</div>
	</div>

	


</div></template>
<script>
import _ from "lodash";
import url_parse from "url-parse";
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
		setInterval(()=>get_current_tab.call(this), 500);
	},

	data(){ return {
		seedfile: "",
		password: "",
		core: null,

		derive_from_url: "",
		derived_password_from_url: "",
		derive_password_error: "",

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
		}
	},

	watch: {
		started(){
			this.$emit("started", this.started);
		},

		derive_from_url(){
			let url_p = url_parse(this.derive_from_url);
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
	},

	methods: {
		rewrite_derive_option(){
			this.derived_password_from_url = "";
			let qs = "?length=" + this.derive_option_length;
			for(let i of ["upper", "lower", "number", "special"]){
				if(!this["derive_option_"+i]) continue;
				qs += "&" + i;
			}
			let url_p = url_parse(this.derive_from_url);
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

				psm_instance = new PSM("default");


				this.password = "";
			} catch(e){
				console.error(e);
				alert("Cannot open seedfile. Bad password?");
			}
		},

		async on_derive(){
			this.derived_password_from_url = "";
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
			this.derive_from_url = await pwdgen.create_url(
				this.current_domain);
			this.on_derive();
		}
	}
}
</script>