import { on, prepare_message } from "app/lib/runtime_message_dispatcher";

const psm = require("password-security-module");

var psm_instance = null;

async function init_with_core(core){
    const PSM = psm.init((e)=>core.digest(e));
    psm_instance = new PSM("default");

    on("vault.decrypt", decrypt_with_vault);
}


function get_pwdgen(){
    if(!psm_instance) throw Error();
    return psm_instance.get_password_generator();
}

function get_vault(){
    if(!psm_instance) throw Error();
    return psm_instance.get_data_vault();
}

function destroy_core(){
    psm_instance = null;
}


function decrypt_with_vault(data, sendResponse){
    let vault = get_vault();
    vault.decrypt(data).then((result)=>{
        sendResponse({ ok: result });
    }).catch(e=>{ sendResponse({ error: e }) });
}





export {
    init_with_core,
    get_pwdgen,
    get_vault,
    destroy_core,
}