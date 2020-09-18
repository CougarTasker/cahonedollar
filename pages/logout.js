exports.controller = null;
exports.location = "/logout/"
exports.addPlayer = player => {};
exports.removePlayer = player => {};
exports.setController = controller=>{
	this.controller = controller
	controller.addReceiveMessageHandler("join",player=>{
	//if a player joins they are no longer logged out
		console.log("reconnect");
		controller.changeState("reconnect",player);
	});
}
exports.getController = ()=>{return this.controller}