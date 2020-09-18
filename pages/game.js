const val = require("../value.js");
const cm = require("../card-master/cm.js");
exports.controller = null;
// change the player state 
// changeState(state,player)
// sendMessage(messageType,messageData,player)
// addReceiveMessageHandler(messageType,handler)

// if player is ommited this will be for all players
// to send a message to a player
players = {};
const whiteCardsCount = 9;

//globals
var blackCard = {};
var combCards = [];
var gameState = val.create(0);
gameState.gameStateTimes = [10,30,30];
gameState.timer;
gameState.timeInterval = {};
gameState.progress = function(self){
	if(!self){
		self = this;
	}
	clearTimeout(self.timer);
	self.timeInterval.start = Date.now();
	self.timeInterval.duration = self.gameStateTimes[self.get()]*1000;
	self.timeInterval.end = self.timeInterval.start + self.timeInterval.duration;
	self.timer = setTimeout(self.progress,self.timeInterval.duration,self);
	self.set(old=>{
		old += 1;
		old = old % self.gameStateTimes.length;
		return old;
	})

}
gameState.stop = function(){
	clearTimeout(self.timer);
	self.set(()=> 0); 
}
gameState.restart = function(){
	self = this;
	clearTimeout(self.timer);
	self.timeInterval.start = Date.now();
	self.timeInterval.duration = self.gameStateTimes[self.get()]*1000;
	self.timeInterval.end = self.timeInterval.start + self.timeInterval.duration;
	self.timer = setTimeout(self.progress,self.timeInterval.duration,self);
	self.set(()=> 0); 
	
}
cm.ready(()=>blackCard = cm.pickBlackCard());

//converts a dangerous card to a safe one removing public keys and hiding text 
var combCardSafe = dirty => {
	var randomizeText = text => {
		var randomizeWord = len => {
			out = "";
			for(n = 0; n<len; n++){
				out += String.fromCharCode(97+Math.floor(Math.random()*26));
			}
			return out;
		};
		return text.replace(/\w+/g,word => randomizeWord(word.length));
	};
	return {id:dirty.id,cards: (gameState.get()==2)? dirty.cards:dirty.cards.map(card=>{return{text:randomizeText(card.text)}}),hidden:gameState.get()!=2}
};
gameState.addSetHandler(()=>{
	exports.controller.broadcastMessage("timeInterval",this.timeInterval);
});
gameState.addSetHandler(()=>{
	//add any waiting players
	exports.controller.changeState("start");
	//reset global state
	blackCard = cm.pickBlackCard();
	combCards = [];
	exports.controller.broadcastMessage("combCards",combCards);
	exports.controller.broadcastMessage("blackCard",blackCard);
	//reset local state;
	for(player of Object.values(players)){
		player.whiteCards = player.whiteCards.filter(card => !player.selectedCards.includes(card));
		nextcards = cm.pickNWhiteCards(player.selectedCards.length);
		exports.controller.sendMessage(player,"whiteCardsRemove",player.selectedCards);
		exports.controller.sendMessage(player,"whiteCardsAdd",nextcards);
		player.whiteCards = player.whiteCards.concat(nextcards);
		player.selectedCards=[];
		exports.controller.sendMessage(player,"selectedCards",	player.selectedCards);
		player.localState = 0;
		exports.controller.sendMessage(player,"localState",	player.localState);
		
	}
},0);
gameState.addSetHandler(()=>{
	cardCazh = Object.values(players).find(player=>!player.beenCardCazh);
	if(!cardCazh){
		//everyone has been the cardcazh
		Object.values(players).forEach(player=>player.beenCardCazh = false);
		cardCazh = Object.values(players).find(player=>!player.beenCardCazh);
	}
	cardCazh.beenCardCazh = true;
	cardCazh.localState = 2;
	exports.controller.sendMessage(cardCazh,"localState",cardCazh.localState);
},1);
gameState.addSetHandler(()=>{
	for(player of Object.values(players)){
		if(player.localState == 0){
			player.localState = 1;
			exports.controller.sendMessage(player,"localState",player.localState);
		}
	}
	exports.controller.broadcastMessage("combCards",combCards);
	if(combCards.length == 0){
		gameState.progress();
	}
},2);
gameState.addSetHandler(val=>exports.controller.broadcastMessage("gameState",val))

exports.location = "/game/"
exports.addPlayer = player => {
	//only happens in game state 0;
	gameState.restart();//restart the game so in gamemode 0
	players[player.publicKey] = player;
	player.whiteCards = cm.pickNWhiteCards(whiteCardsCount);
	player.selectedCards = [];
	player.localState = 0;
	player.beenCardCazh = false;
};
exports.removePlayer = player => {
	delete players[player.publicKey];
	if(Object.values(players).length=2){
		gameState.stop();//if there arent enough players
		this.controller.changeState("stop");//remove the remaing players
	}else if(gameState.get() != 0){
		//if a player leaves while the game is being played
		gameState.restart();//restart the game
	}
};
exports.setController = controller=>{
	this.controller = controller
	controller.addReceiveMessageHandler("close",player=>{//if the player leaves the page 
		controller.changeState("logout",player);
	});
	controller.addReceiveMessageHandler("localData",player=>{
		controller.sendMessage(player,"whiteCards",		player.whiteCards);
		controller.sendMessage(player,"selectedCards",	player.selectedCards);
		controller.sendMessage(player,"localState",		player.localState)
	});
	controller.addReceiveMessageHandler("selectedCardsAdd",(player,cardID)=>{
			card = player.whiteCards.find(card=>card.id==cardID);
			if(card && !player.selectedCards.includes(card) && gameState.get()==1 && player.localState == 0){
				player.selectedCards.push(card);
				controller.sendMessage(player,"selectedCardsAdd",card);
				if(player.selectedCards.length==blackCard.spaces){
					//if they have selected all the nessary cards then we are no logner waiting for them 
					player.localState = 1;
					controller.sendMessage(player,"localState",player.localState);
					comb = {id:combCards.length,publicKey:player.publicKey,cards:player.selectedCards};
					combCards.push(comb);
					controller.broadcastMessage("combCardsAdd",combCardSafe(comb));//todo only send the id and number of cards
					if(combCards.length == Object.keys(players).length-1){
						//if everyone has now submitted their cards
						gameState.progress();
					}
				}
			}
	});
	controller.addReceiveMessageHandler("selectedCardsRemove",(player,cardID)=>{
			card = player.whiteCards.find(card=>card.id==cardID);
			if(card && player.selectedCards.includes(card) && gameState.get()==1 && player.localState == 0){
				player.selectedCards = player.selectedCards.filter(card => card.id != cardID);
				controller.sendMessage(player,"selectedCardsRemove",card);
			}
	});

	controller.addReceiveMessageHandler("globalData",player=>{
		controller.sendMessage(player,"blackCard",	    blackCard);
		controller.sendMessage(player,"combCards",	    combCards.map(combCardSafe));
		controller.sendMessage(player,"gameState",	    gameState.get());
		controller.sendMessage(player,"timeInterval",	gameState.timeInterval);
	});
	controller.addReceiveMessageHandler("combCardsSelect",(player,cardID)=>{
		if(player.localState == 2 && gameState.get() == 2){
			winner = combCards.find(card=>card.id==cardID);
			if(winner){
				controller.sendMessage(players[winner.publicKey],"win");
			    gameState.progress();
			}
		}
	});

	//you need to remove this !!!!!!!!
	controller.addReceiveMessageHandler("start",()=>gameState.progress());
}
exports.getController = ()=>{return this.controller}