
nameControl = require("../nameControl.js");
exports.controller = null;
// change the player state 
// changeState(state,player)
// sendMessage(messageType,messageData,player)
// addReceiveMessageHandler(messageType,handler)

// if player is ommited this will be for all players
// to send a message to a player
waitingPlayerList = [];
playerToRow = player=>{
							out = {name:player.name,id:player.publicKey};
							if(player.highScore){
								out.highScore = player.highScore;
							}
							return out;
						}
exports.location = "/waiting_room/"
exports.addPlayer = player => {
	waitingPlayerList.push(player);
	this.controller.broadcastMessage("addPlayer",playerToRow(player));
};
exports.removePlayer = player => {
	waitingPlayerList  = waitingPlayerList.filter(cur=>cur.publicKey != player.publicKey);
	this.controller.broadcastMessage("removePlayer",player.publicKey);
};
exports.setController = controller=>{
	this.controller = controller
	controller.addReceiveMessageHandler("getList",player=>{
		controller.sendMessage(player,"receiveList",waitingPlayerList.map(playerToRow));
	});
	controller.addReceiveMessageHandler("myData",player=>{
		data = {name:player.name};
		if(player.highScore){
			data.highScore = player.highScore;
		}
		if(player.gamesWon){
			data.gamesWon = player.gamesWon;
		}
		if(player.gamesPlayed){
			data.gamesPlayed = player.gamesPlayed;
		}
		controller.sendMessage(player,"myData",data);
	});
	controller.addReceiveMessageHandler("close",player=>{//if the player leaves the page 
		controller.changeState("logout",player);
	});
	controller.addReceiveMessageHandler("name",(player,name)=>{
		resp = nameControl.editName(player.name,name);
		if(resp.success){
			controller.broadcastMessage("editName",{id:player.publicKey,name:resp.name});
			player.name = resp.name;
		}
		controller.sendMessage(player,"name",resp);
	});
}
exports.getController = ()=>{return this.controller}
