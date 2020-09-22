

exports.controller = null;
// change the player state 
// changeState(state,player)
// sendMessage(messageType,messageData,player)
// addReceiveMessageHandler(messageType,handler)

// if player is ommited this will be for all players
// to send a message to a player
exports.setScoreboard = scoreboard => this.scoreboard = scoreboard;
exports.location = "/admin/"
exports.addPlayer = player => {};
exports.removePlayer = player => {};
exports.setController = controller=>{
	this.controller = controller
	this.controller.addReceiveMessageHandler("scoreboard",(player)=>{
		this.controller.sendMessage(player,"scoreboard",this.scoreboard.get());
	});
}
exports.getController = ()=>{return this.controller}