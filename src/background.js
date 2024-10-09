import _ from "lodash";
import until from "app/lib/until";
import { on, prepare_message } from "app/lib/runtime_message_dispatcher";

const MENU_FILL_ID = "neoatlantis-slate-password";




async function on_browser_menus_clicked(info, tab){
	//let el = browser.contextMenus.getTargetElement(targetElementId);
	console.log("clicked", info);

	const menuItemId = _.get(info, "menuItemId");
	if(menuItemId != MENU_FILL_ID) return;

	const pageUrl = new URL(_.get(info, "pageUrl"));
	console.log(pageUrl);

	await request_password();

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

on("password.update", function(data, sendResponse){
	console.log("Received updated password at background.");
	console.log(data);
	// TODO save this password.
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