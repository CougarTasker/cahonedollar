const express = require('express');
var cookieParser = require('cookie-parser')
var Id = require("./id.js");
var app = express();
var expressWs = require('express-ws')(app);
app.use(cookieParser());



var players = {};
//need to seperate sending messages and broucasting messages for simplisity



login = require("./pages/login.js");
waiting = require("./pages/waiting.js");
game = require("./pages/game.js");
logout = require("./pages/logout.js");
admin =  require("./pages/admin.js");

loginController = new Controller(login);
waitingController = new Controller(waiting);
gameController = new Controller(game);
logoutController = new Controller(logout);
adminController = new Controller(admin);

login.setController(loginController);
waiting.setController(waitingController);
game.setController(gameController);
logout.setController(logoutController);
admin.setController(adminController);


rel=[
{from:login,	transition:"admin",		to:admin},
{from:login,	transition:"user",		to:waiting},
{from:waiting,	transition:"start",		to:game},
{from:game,		transition:"stop",		to:waiting},
{from:game,		transition:"logout",	to:logout},
{from:waiting,	transition:"logout",	to:logout},
{from:logout,	transition:"reconnect",	to:waiting},
{from:waiting,	transition:"restart",	to:game},
{from:game,		transition:"restart",	to:game}
];



function Controller(page){
	this.page = page;
	this.receiveMessageHandlers = [];//{messageType,function}  function(player,data)
	this.changeState = (player,state)=>{
		trans = rel.filter(val => {return val.transition == state});
		var swap = playerWrapper=>{
			for(transition of trans){
				if(playerWrapper.page == transition.from){
					playerWrapper.page = transition.to;
					//add and remove the player from the relvent pages
					transition.from.removePlayer(playerWrapper.data);
					transition.to.addPlayer(playerWrapper.data);
					playerWrapper.page.getController().sendMessage(playerWrapper.data,"location",playerWrapper.page.location);
					//send a redirect message to the player whos page has changed
				}
			}
		};
		if(player){
			playerWrapper = players[player.privateKey];//convert from player data to player wrapper;
			swap(playerWrapper);
		}else{
			for(playerWrapper of object.values(players)){
				swap(playerWrapper);
			}
		}
	}
	this.addReceiveMessageHandler =(messageType,handler)=>{
		this.receiveMessageHandlers.push({messageType:messageType,function:handler});
	}
	var checkSend = (playerWrapper,message)=>{
			console.log("player" + playerWrapper.page.location);
			console.log("message"+ JSON.stringify(message));
			if(playerWrapper.ws != null && playerWrapper.ws.readyState == 1){//check the connection is ready
				if(playerWrapper.page==this.page){
					playerWrapper.ws.send(JSON.stringify(message));//send message
				}else{
					console.log("player" + playerWrapper.page.location);
					console.log("controller "+ this.page.location);
					console.log("send message to gone player");
				}
			}else{
				setTimeout(()=>{
					this.sendMessage(playerWrapper.data,message.messageType,message.messageData);//retry later
				},1000);
			}
		}
	this.broadcastMessage = (messageType,messageData)=>{
		var message = {};
		message.messageType=messageType;
		if(messageData){
			message.messageData=messageData;
		}
		relvent = Object.values(players).filter(playerWrapper=>{return playerWrapper.page==this.page});
		for(playerWrapper of relvent){
			checkSend(playerWrapper,message);
		}
	}
	this.sendMessage = (player,messageType,messageData)=>{
		var message = {};
		message.messageType=messageType;
		if(messageData){
			message.messageData=messageData;
		}
		playerWrapper = players[player.privateKey];//convert from player data to player wrapper;
		checkSend(playerWrapper,message);
	}
}

function triggerHandlers(playerWrapper,data){
	controller =  playerWrapper.page.getController();
	for(handler of controller.receiveMessageHandlers){
		if(handler.messageType == data.messageType){
			if(data.messageData){
				handler.function(playerWrapper.data,data.messageData);
			}else{
				handler.function(playerWrapper.data);
			}
		}
	}
}
var Player = function(){
	this.page = login;
	this.ws = null;
	this.data= Id.gen();
	this.setWs = ws =>{
		var self = this;
		if(this.ws){//if the player allready is connected then close the other session
			this.ws.send('{"messageType":"location","messageData":"/replaced/"}');
		}
		this.ws = ws;
		ws.on('message', function incoming(data) {
			if(this == self.ws){//only ignore old connections
				data = JSON.parse(data);
				//control messages
				blacklist = ["close","open","join"];
				if(!blacklist.includes(data.messageType)){
				//the user cant send a controll message
					triggerHandlers(self,data);
				}
			}
		});
		ws.on('close',function close(){
			if(this == self.ws){//only ignore old connections closing 
				self.ws = null;//remove the dead ws
				setTimeout(()=>{//when the player leaves give 5 seconds for them to reconnect
					if(!self.ws){//if the player hasnt reconnected send the close message
						triggerHandlers(self,{messageType:"close"});
					}
				},5000);
			}
		});
		triggerHandlers(self,{messageType:"open"});//let pages know the the ws is open
	}
}


app.ws('*', function(ws, req) {
	if(req.cookies["id"] && Id.isPri(req.cookies["id"])){
		//get player by id
		player = players[req.cookies["id"]];
		player.setWs(ws);
	}else{
		//if not given an id then they shouldnt even be able to connect to websocket
		ws.close()
	}
});
GlobalAdresses = /^\/(js|css|replaced)\/.*/

app.get("*",function(req,res,next){
	var location = "/";
	if(req.cookies["id"]&&Id.isPri(req.cookies["id"])){
		//get player by id
		player = players[req.cookies["id"]];
		//let the controller know the player has join
		triggerHandlers(player,{messageType:"join"});
		//set the location to the page the player should be in.
		location = player.page.location
	}else{
		//new player
		var p = new Player();
		players[p.data.privateKey] = p;
		res.cookie('id', p.data.privateKey);
		location = "/"; 
		// redirect to the login page for new users 
	}

	if(GlobalAdresses.test(req.url) || req.url == location){
		//everthing is fine carry on
		next();
	}else{
		//the player is at the wrong adress
		res.redirect(location);
	}
});




app.use(express.static('public'));
var port = process.env.PORT || 80;
app.listen(port);

