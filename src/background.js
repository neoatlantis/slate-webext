import _ from "lodash";
import until from 'async-until';
import { on, prepare_message } from "app/lib/runtime_message_dispatcher";

const MENU_FILL_ID = "neoatlantis-slate-password";


var requested_password = null;



async function request_password(){
	let password = _.get(
		await browser.storage.local.get('password'),
		'password'
	);
	if(!_.isString(password)) return null;


	requested_password = null;
	let decrypt_request_message = prepare_message("vault.decrypt", password);
	chrome.runtime.sendMessage(decrypt_request_message);
	await until(()=>{ return !_.isNil(requested_password) }, {
		timeout: 1000,
		loopDelay: 100,
	});

	return !_.isNil(requested_password);
}



async function on_browser_menus_clicked(info, tab){
	//let el = browser.contextMenus.getTargetElement(targetElementId);
	console.log("clicked", info);

	const menuItemId = _.get(info, "menuItemId");
	if(menuItemId != MENU_FILL_ID) return;

	const pageUrl = new URL(_.get(info, "pageUrl"));
	console.log(pageUrl);

	if(!await request_password()) return;


	let text = _.get(requested_password, "password");// TODO verify domain?
	if(!_.isString(text)) return;

	function injected(text){
		document.execCommand('insertText', false, text);
	}

    browser.scripting.executeScript({
    	target: { frameIds: [info.frameId], tabId: tab.id },
    	func: injected,
    	args: [text],
    });

    requested_password = null;
}

on("password.cache", function(data){
	console.log("Received updated password at background.");
	let uuid = data.uuid;
	browser.storage.local.set({
		password: data.encrypted,
	});
	browser.runtime.sendMessage(prepare_message(
		"password.cache.updated",
		{ uuid }
	));
});

on("password.decrypted", function(data){
	console.log("Received decrypted password.");
	requested_password = data;
});






browser.runtime.onInstalled.addListener(() => {

	console.log("Slate: init");

	browser.contextMenus.create({
		id: MENU_FILL_ID,
		title: "NeoAtlantis Slate: Fill password here.",
		documentUrlPatterns: ["*://*/*"],
		contexts: ["password", "editable"]
	});
});

browser.contextMenus.onClicked.addListener(on_browser_menus_clicked);