<template><div>

    <div class="card p-1 bg-light">

        <div class="mb-1 input-group-sm input-group">
            <span class="input-group-text bg-white">Current domain:</span>
            <input
                class="form-control font-monospace bg-secondary text-white"
                type="text" v-model="current_domain" readonly />
        </div>

        <label class="label">
            Password Request URL:
        </label>

        <div class="mb-1 input-group-sm input-group">
            <a href="#" class="btn btn-outline-secondary"
                @click.prevent="on_create">New</a>
            <a href="#" class="btn btn-outline-secondary"
                @click.prevent="on_paste">Paste</a>
            <input
                class="form-control font-monospace"
                type="text"
                v-model="derive_from_url"
                placeholder="psm-pwdgen://"
                @click="$event.target.select()"
            />
            <a href="#" class="btn btn-outline-secondary"
                @click.prevent="on_url_copy">Copy</a>            
        </div>
            
        <div class="mb-1 input-group-sm input-group">
            <span class="input-group-text bg-white">Length:</span>
            <input 
                class="form-control font-monospace"
                type="number" v-model="derive_option_length" min="6" max="256"/>

            <button
                class="btn"
                :class="{
                    'btn-primary':derive_option_upper,
                    'btn-outline-secondary':!derive_option_upper
                }"
                @click="derive_option_upper=!derive_option_upper"
            >ABC</button>
            <button
                class="btn"
                :class="{
                    'btn-primary':derive_option_lower,
                    'btn-outline-secondary':!derive_option_lower
                }"
                @click="derive_option_lower=!derive_option_lower"
            >abc</button>
            <button
                class="btn"
                :class="{
                    'btn-primary':derive_option_number,
                    'btn-outline-secondary':!derive_option_number
                }"
                @click="derive_option_number=!derive_option_number"
            >123</button>
            <button
                class="btn"
                :class="{
                    'btn-primary':derive_option_special,
                    'btn-outline-secondary':!derive_option_special
                }"
                @click="derive_option_special=!derive_option_special"
            >@#$</button>
        </div>

        <div class="">
            <button
                class="btn btn-sm btn-primary" @click="on_derive"
                :disabled="!can_derive_password"
            >Derive</button>
        </div>

        <div style="color:red" class="field" v-if="derive_password_error || !current_domain_matched">
            <span v-if="derive_password_error">{{ derive_password_error }}</span>
            <span v-else>
                Password URL not for current domain. Deriving not allowed.
                <a href="#" @click.prevent="override_current_domain_once=true">Override once (dangerous!).</a>
            </span>            
        </div>
    </div>


    <div class="mt-2 card p-1 bg-light" v-if="derived_password_from_url">
        <div class="field">
            <label class="label">
                Result:
            </label>
            <div class="mb-1 input-group-sm input-group">
                <input 
                    class="form-control form-control-sm font-monospace"
                    :type="reveal_derived_password?'text':'password'"
                    v-model="derived_password_from_url"
                    readonly
                    @click="$event.target.select()"
                />
                <button
                    class="btn btn-primary"
                    @click.prevent="reveal_derived_password=!reveal_derived_password"
                >{{ reveal_derived_password ? 'Hide':'Show'}}</button>
            </div>
        </div>
        <div class="field">
            <div class="buttons">
                <button
                    class="btn btn-primary btn-sm" @click="on_result_copy"
                >Copy</button>
                <button
                    class="btn btn-danger btn-sm ms-1" @click="clear_output"
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
import { get_pwdgen, get_vault } from "./psm_instance.js";
import { on, prepare_message } from "app/lib/runtime_message_dispatcher";
import { json2buffer, buffer2json } from "app/lib/json_buffer_conv";


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

export default {

    mounted(){
        browser.tabs.onActivated.addListener(()=>{
            get_current_tab.call(this);
        });
        browser.tabs.onUpdated.addListener(()=>{
            get_current_tab.call(this);
        });
        get_current_tab.call(this);
    },

    data(){ return {
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
        override_current_domain_once: false,
        deriving_url_required_domain: "",


        /// #if DEV
        derive_from_url: "psm-pwdgen://google.com/b29be6d5fcd91a87ace7927583358a6bd04afed328d40e0bea47?length=20&upper",
        /// #endif
    }},

    computed: {
        current_domain_matched(){
            if(this.override_current_domain_once) return true;
            return this.deriving_url_required_domain == this.current_domain;
        },

        can_derive_password(){
            if(!this.current_domain_matched) return false;
            if(
                !this.derive_option_upper &&
                !this.derive_option_lower &&
                !this.derive_option_number &&
                !this.derive_option_special
            ){
                return false;
            }   
            return true;
        },
    },

    watch: {

        current_domain_matched(){
            if(this.override_current_domain_once) return;
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
        async broadcast_result(){
            // Send password to background for backup. 
            // Password & domain info is stored encrypted, so it can be saved
            // securely on local storage.
            //
            // -- TODO maybe we should use temporary key for this storage!
            let message = prepare_message(
                "password.cache", 
                await get_vault().encrypt(json2buffer({
                    password: this.derived_password_from_url.toString(),
                    domain: this.current_domain.toString(),
                }))
            );
            chrome.runtime.sendMessage(message);
        },

        clear_output(keep_override){
            this.derived_password_from_url = "";
            this.derive_password_error = "";
            this.reveal_derived_password = false;
            if(!keep_override){
                this.override_current_domain_once = false;
            }
            try{
                navigator.clipboard.writeText("");
            } catch(e){
            }
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

        async on_derive(){
            this.clear_output(true);
            let pwdgen = get_pwdgen();

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
            let pwdgen = get_pwdgen();
            this.derive_from_url = await pwdgen.create_url(
                this.current_domain);
            this.on_derive();
        },

        async on_paste(){
            let text = await navigator.clipboard.readText();
            this.derive_from_url = text;
        },

        async on_result_copy(){
            try{
                await navigator.clipboard.writeText(
                    this.derived_password_from_url);
            } catch(e){
                alert("Failed writing password to clipboard.");
            }
        },

        async on_url_copy(){
            try{
                await navigator.clipboard.writeText(
                    this.derive_from_url);
            } catch(e){
                alert("Failed writing url to clipboard.");
            }
        }
    },

    components: {
        EmojiChar,
    }
}
</script>