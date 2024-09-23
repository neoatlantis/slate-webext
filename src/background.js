import _ from "lodash";

const MENU_FILL_ID = "neoatlantis-slate-password";


const channel_update_password = new BroadcastChannel("slate/update-password");
let current_password = {}; // { password, domain }
channel_update_password.onmessage = (event)=>{
	current_password = event.data;
}



async function on_browser_menus_clicked(info, tab){
	//let el = browser.contextMenus.getTargetElement(targetElementId);
	console.log("clicked", info);

	const menuItemId = _.get(info, "menuItemId");
	if(menuItemId != MENU_FILL_ID) return;

	const pageUrl = new URL(_.get(info, "pageUrl"));
	console.log(pageUrl);

	let text = _.get(current_password, "password");// TODO verify domain?
	if(!_.isString(text)) return;

	function injected(text){
		document.execCommand('insertText', false, text);
	}

    browser.scripting.executeScript({
    	target: { frameIds: [info.frameId], tabId: tab.id },
    	func: injected,
    	args: [text],
    });
}




browser.runtime.onInstalled.addListener(() => {

	console.log("Slate: init");

	browser.contextMenus.create({
		id: MENU_FILL_ID,
		title: "NeoAtlantis Slate: Fill password here.",
		documentUrlPatterns: ["*://*/*"],
		contexts: ["password", "editable"]
	});

	browser.contextMenus.onClicked.addListener(on_browser_menus_clicked);
});