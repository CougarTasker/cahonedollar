const val = require("../value.js");
const cm = require("../card-master/cm.js");
const admin = require("./admin.js");
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
var timeInterval = {};
var blackCard = {};
var combCards = [];
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
	return {id:dirty.id,cards: (gameState.get()==4)? dirty.cards:dirty.cards.map(card=>{return{text:randomizeText(card.text)}}),hidden:gameState.get()!=4}
};
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

var scoreboard = val.create([]);


scoreboard.addPlayer = function(player){
	data = {id:player.publicKey,name:player.name,score:0,status:player.localState,winner:false};
	this.set(old=>{
	 old.push(data);
	 // old.sort((a,b)=>a.score-b.score);
	 return old;
	});
	exports.controller.broadcastMessage("scoreboardAdd",data);
	admin.getController().broadcastMessage("scoreboardAdd",data);
}
scoreboard.removePlayer = function(player){
	this.set(old=>{
	 old = old.filter(p => p.id != player.publicKey);
	 // old.sort((a,b)=>a.score-b.score);
	 return old;
	});
	exports.controller.broadcastMessage("scoreboardRemove",player.publicKey);
	admin.getController().broadcastMessage("scoreboardRemove",player.publicKey);
}
scoreboard.winner = function(player){

	this.set(old=>{
		old = old.map(p =>{
			p.winner = p.id == player.publicKey
			if(p.winner){
				p.score += 1;
			}
			return p;
		});
		old.sort((a,b)=>a.score-b.score).reverse();
	 	return old;
	});
	exports.controller.sendMessage(players[player.publicKey],"win");
	exports.controller.broadcastMessage("scoreboardWinner",player.publicKey);
	admin.getController().broadcastMessage("scoreboardWinner",player.publicKey);
}
scoreboard.statusChange = function(player){
	this.set(old=>{
		old = old.map(p => {
			if(p.id == player.publicKey){
				p.status = player.localState
			}
			return p;
		})
		return old
	});
	exports.controller.broadcastMessage("scoreboardStatusChange",{id:player.publicKey,status:player.localState});
	admin.getController().broadcastMessage("scoreboardStatusChange",{id:player.publicKey,status:player.localState});
}

var gameState = val.create(0);
gameState.gameStateTimes = [Infinity,5,3,45,30];
gameState.timer;
gameState.addSetHandler(val=>{
	clearTimeout(gameState.timer);
	timeInterval.start = Date.now();
	timeInterval.duration = gameState.gameStateTimes[val]*1000;
	timeInterval.end = timeInterval.start + timeInterval.duration;
	if(isFinite(timeInterval.duration)){
		gameState.timer = setTimeout(gameState.set,timeInterval.duration,val=>{
			if(val != 0){
				return (val)%4 +1
			}
			return val;
		});
	}
	controller.broadcastMessage("timeInterval",	timeInterval);
});

cm.ready(()=>blackCard = cm.pickBlackCard());



// gameState.addSetHandler(()=>{
// 	exports.controller.broadcastMessage("timeInterval",this.timeInterval);
// });
gameState.addSetHandler(()=>{
	//add any waiting players
	//exports.controller.changeState("start");
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
		scoreboard.statusChange(player);
		exports.controller.sendMessage(player,"localState",	player.localState);
		
	}
},1);
gameState.addSetHandler(()=>{
	if(Object.keys(players).length<3){
		this.controller.changeState("stop");//remove the remaing players
		gameState.set(val=>0);//if there arent enough players when the game starts 
	}
},2);
gameState.addSetHandler(()=>{
	cardCazh = Object.values(players).find(player=>!player.beenCardCazh);
	if(!cardCazh){
		//everyone has been the cardcazh
		Object.values(players).forEach(player=>player.beenCardCazh = false);
		cardCazh = Object.values(players).find(player=>!player.beenCardCazh);
	}
	if(cardCazh){
		cardCazh.beenCardCazh = true;
		cardCazh.localState = 2;
		scoreboard.statusChange(cardCazh);
		exports.controller.sendMessage(cardCazh,"localState",cardCazh.localState);
	}
},2);
gameState.addSetHandler(()=>{
	for(player of Object.values(players)){
		if(player.localState == 0){
			player.localState = 1;
			scoreboard.statusChange(player);
			exports.controller.sendMessage(player,"localState",player.localState);
		}
	}
	shuffle(combCards);
	exports.controller.broadcastMessage("combCards",combCards);
	if(combCards.length == 0){
		gameState.set(val=>{if(val == 4){return 1}else{return val;}});
	}
},4);
gameState.addSetHandler(val=>exports.controller.broadcastMessage("gameState",val))

exports.location = "/game/"
exports.addPlayer = player => {
	//only happens in game state 0;
	gameState.set(val=>1);
	players[player.publicKey] = player;
	player.whiteCards = cm.pickNWhiteCards(whiteCardsCount);
	player.selectedCards = [];
	player.localState = 0;
	player.beenCardCazh = false;
	scoreboard.addPlayer(player)
};
exports.removePlayer = player => {
	scoreboard.removePlayer(player);
	//remove unnessary data 
	delete player.whiteCards;
	delete player.selectedCards;
	delete player.localState;
	delete player.beenCardCazh;

	delete players[player.publicKey];
	gameState.set(val=>{
		if(val != 0){
			return 1;
		}else{
			return 0;//dont reset a game that is over when removing the players
		}
	});
};
exports.setController = controller=>{
	this.controller = controller
	controller.addReceiveMessageHandler("close",player=>{//if the player leaves the page 
		controller.changeState("logout",player);
	});
	controller.addReceiveMessageHandler("localData",player=>{
		controller.sendMessage(player,"whiteCards",		player.whiteCards);
		controller.sendMessage(player,"selectedCards",	player.selectedCards);
		controller.sendMessage(player,"localState",		player.localState);
		controller.sendMessage(player,"publicKey",		player.publicKey);
	});
	controller.addReceiveMessageHandler("selectedCardsAdd",(player,cardID)=>{
			card = player.whiteCards.find(card=>card.id==cardID);
			if(card && !player.selectedCards.includes(card) && gameState.get()==3 && player.localState == 0){
				player.selectedCards.push(card);
				controller.sendMessage(player,"selectedCardsAdd",card);
				if(player.selectedCards.length==blackCard.spaces){
					//if they have selected all the nessary cards then we are no logner waiting for them 
					player.localState = 1;
					controller.sendMessage(player,"localState",player.localState);
					scoreboard.statusChange(player);
					comb = {id:combCards.length,publicKey:player.publicKey,cards:player.selectedCards};
					combCards.push(comb);
					controller.broadcastMessage("combCardsAdd",combCardSafe(comb));//todo only send the id and number of cards
					if(combCards.length == Object.keys(players).length-1){
						//if everyone has now submitted their cards
						gameState.set(val=>{
							if(val == 3){
								return 4;
							} else{
								return val;
							}
						});
					}
				}
			}
	},{
		"type": "string",
		"minLength": 12,
		"maxLength": 12
	});
	controller.addReceiveMessageHandler("selectedCardsRemove",(player,cardID)=>{
			card = player.whiteCards.find(card=>card.id==cardID);
			if(card && player.selectedCards.includes(card) && gameState.get()==3 && player.localState == 0){
				player.selectedCards = player.selectedCards.filter(card => card.id != cardID);
				controller.sendMessage(player,"selectedCardsRemove",card);
			}
	},{
		"type": "string",
		"minLength": 12,
		"maxLength": 12
	});
	controller.addReceiveMessageHandler("globalData",player=>{
		controller.sendMessage(player,"blackCard",	    blackCard);
		controller.sendMessage(player,"combCards",	    combCards.map(combCardSafe));
		controller.sendMessage(player,"gameState",	    gameState.get());
		controller.sendMessage(player,"timeInterval",	timeInterval);
		controller.sendMessage(player,"scoreboard",		scoreboard.get());
	});
	controller.addReceiveMessageHandler("combCardsSelect",(player,cardID)=>{
		if(player.localState == 2 && gameState.get() == 4){
			winingCard = combCards.find(card=>card.id==cardID);
			if(winingCard){
				winner = players[winingCard.publicKey]
				winner.gamesWon += 1;
				scoreboard.winner(winner);
			    gameState.set(val=>1);
			    //finalize socres
			    for(player of Object.values(players)){
					player.gamesPlayed +=1;
					player.rounds.push(player == winner);
					if(player.rounds.length>10){
						player.rounds.shift();
					}
			    }
			    totalScore= winner.rounds.reduce((acc,cur)=>acc+cur,0);
				if(totalScore > winner.highScore){
					winner.highScore = totalScore;
				}
			}
		}
	},{
		"type": "string",
		"minLength": 12,
		"maxLength": 12
	});
}
exports.getController = ()=>{return this.controller}

admin.setScoreboard(scoreboard);