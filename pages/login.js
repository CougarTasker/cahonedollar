nameControl = require("../nameControl.js");


exports.controller = null;
// change the player state 
// changeState(state,player)
// sendMessage(messageType,player,messageData) // there could be no data
// addReceiveMessageHandler(messageType,handler) handler = (player,data) there could be no data

// if player is ommited this will be for all players
// to send a message to a player
exports.location = "/"
exports.addPlayer = player => {};
exports.removePlayer = player => {};
exports.setController = controller=>{
	this.controller = controller
	controller.addReceiveMessageHandler("name",(player,name)=>{
		if(name=="admin"){
			player.name = name;
			controller.changeState("admin",player);
		}else{
			response = nameControl.addName(name);
			if(response.success){
				//set data
				player.name = name;
				player.gamesPlayed =0;
				player.gamesWon = 0;
				player.rounds = [];
				player.highScore = 0;
				controller.changeState("user",player);
			}else{
				controller.sendMessage(player,"name",response);
			}
		}
	});
}
exports.getController = ()=>{return this.controller}
