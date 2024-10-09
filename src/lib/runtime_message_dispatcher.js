import _ from "lodash";

let handlers = {};

browser.runtime.onMessage.addListener((message, sender, sendResponse)=>{
	let topic = _.get(message, "topic"),
		data = _.get(message, "data");

	if(_.isFunction(handlers[topic])){
		handlers[topic].call({
			message,
			sender,
		}, data, sendResponse); // function (data, sendResponse) with { this.message, this.sender } as context
	};
});

function on(topic, func){ handlers[topic] = func };
function prepare_message(topic, data){
	return { topic, data };
}

export { on, prepare_message };

