

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
	this.controller.addReceiveMessageHandler("winner",(player,id)=>{
		this.scoreboard.winner({publicKey:id});
	});
	controller.addReceiveMessageHandler("start",player=>{//if the player leaves the page 
		controller.changeState("start");
	});

	controller.addReceiveMessageHandler("stop",player=>{//if the player leaves the page 
		controller.changeState("stop");
	});
}
exports.getController = ()=>{return this.controller}