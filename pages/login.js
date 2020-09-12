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
			controller.changeState(player,"admin");
		}else{
			response = nameControl.addName(name);
			if(response.success){
				player.name = name;
				player.gamesPlayed =0;
				controller.changeState(player,"user");
			}else{
				controller.sendMessage(player,"name",response);
			}
		}
	});
}
exports.getController = ()=>{return this.controller}
