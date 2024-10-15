<template><div>

<div class="mt-2 card p-1 bg-light" v-if="password">
    <div class="field">
        <strong>Your password:</strong>
        <div class="mb-1 input-group-sm input-group">
            <input 
                class="form-control form-control-sm font-monospace"
                :type="reveal?'text':'password'"
                :value="password"
                readonly
                @click="$event.target.select()"
            />
            <button
                class="btn btn-primary"
                @click.prevent="reveal=!reveal"
            >{{ reveal ? 'Hide':'Show'}}</button>
        </div>
    </div>
    <div class="field">
        <div class="buttons">
            <button
                class="btn btn-primary btn-sm" @click="on_copy"
            >Copy</button>
            <button
                class="btn btn-danger btn-sm ms-1" @click="on_clear"
            >Clear</button>
        </div>
    </div>
</div>


</div></template>
<script>
import { get_vault } from "./psm_instance.js";
import { json2buffer, buffer2json } from "app/lib/json_buffer_conv";
import { on, prepare_message } from "app/lib/runtime_message_dispatcher";
const uuid = require("uuid");


export default {

	mounted(){
        on("password.cache.updated", (data)=>{
            if(data.uuid == this.uuid){
                // TODO send notification
                return;
            }
            this.on_clear();
        });
    },

	props: [
		"password",
		"domain",
	],

	data(){ return {
		uuid: uuid.v4(),
		reveal: false,
	}},

	watch: {
		password(){ this.broadcast_result() },
	},

	methods: {

		async on_copy(){
            try{
                await navigator.clipboard.writeText(this.password);
            } catch(e){
                alert("Failed writing password to clipboard.");
            }
        },

        async on_clear(){
        	this.$emit("clear");
        },

        async broadcast_result(){
            // Send password to background for backup. 
            // Password & domain info is stored encrypted, so it can be saved
            // securely on local storage.
            //
            // -- TODO maybe we should use temporary key for this storage!
            let message = prepare_message(
                "password.cache",
                {
                    uuid: this.uuid,
                    encrypted: await get_vault().encrypt(json2buffer({
                        password: this.password.toString(),
                        domain: this.domain.toString(),
                    })),
                }
            );
            chrome.runtime.sendMessage(message);
        },


	}

}
</script>