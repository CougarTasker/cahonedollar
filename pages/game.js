exports.controller = null;



gameState = 0; // 0 = pick white cards, 1 pick winning card, 2 celbration and scorebord
this.WinningCardPicker = null;
this.players = {};
exports.addPlayer = player => {
	this.players[player.publicKey] = player
};
exports.removePlayer = player => {
	
	delete this.players[players.publicKey];
};


exports.location = "/game/"

exports.setController = controller=>{
	this.controller = controller
	
}
exports.getController = ()=>{return this.controller}