

exports.controller = null;
// change the player state 
// changeState(state,player)
// sendMessage(messageType,messageData,player)
// addReceiveMessageHandler(messageType,handler)

// if player is ommited this will be for all players
// to send a message to a player

exports.location = "/admin/"
exports.addPlayer = player => {};
exports.removePlayer = player => {};
exports.setController = controller=>{
	this.controller = controller
	controller.addReceiveMessageHandler("name",(data,player)=>{
		console.log("name!!");
		player.name = data;
		controller.changeState("user",player);
	});
}
exports.getController = ()=>{return this.controller}