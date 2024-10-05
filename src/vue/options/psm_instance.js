const psm = require("password-security-module");

var psm_instance = null;

async function init_with_core(core){
    const PSM = psm.init((e)=>core.digest(e));
    psm_instance = new PSM("default");
}

function get_pwdgen(){
    if(!psm_instance) throw Error();
    return psm_instance.get_password_generator();
}

function destroy_core(){
    psm_instance = null;
}

export {
    init_with_core,
    get_pwdgen,
    destroy_core,
}