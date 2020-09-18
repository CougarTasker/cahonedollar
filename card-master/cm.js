const fs = require("fs");
const csv = require("csv-parse");
function cardMaster(file,done){
	this.whiteCount = 0;
	this.blackCount = 0
	this.white= [];
	this.black = [];
	

	fs.createReadStream(file)
  .pipe(csv())
  .on('data', (row) => {
  	if(row[0] =="Answer"){
  		this.white.push({
  			id:this.whiteCount,
  			text: row[1],
  		});
  		this.whiteCount++;
  	}else{
  		rgx =/(^|.)_+($|.)/g;
  		spc =row[1].match(rgx);
  		if(spc != null){
  			  		this.black.push({
  			id:this.blackCount,
  			text: row[1],
  			spaces:spc.length
  		});
  		this.blackCount++;
  	}
  	}
  }).on("end",done);

  this.pickWhiteCard = ()=>{
  	return this.white[Math.floor(Math.random() * (this.whiteCount-1))];
  };
   this.pickBlackCard = ()=>{
  	return this.black[Math.floor(Math.random() * (this.blackCount-1))];
  };
  this.pickNWhiteCards = (n)=>{
  	out = [];
  	for(i=0;i<n;i++){
  		out.push(this.pickWhiteCard());
  	}
  	return out;
  };

}

var ready = [];
var CompCount = 0;
var total = 2;
done = ()=>{
  CompCount += 1;
  if(CompCount == total){
    ready.forEach(fun => fun())
  }
}

//function multiCardMaster(cma,cmb,fact){
	exports.cma= new cardMaster("./cust.csv",done);
	exports.cmb = new cardMaster("./Cards_Against_Humanity.csv",done);
	exports.fact = 0.5;
	exports.pblack = []
  exports.ready = (fun)=>{
    if(CompCount == total){
      fun();
    }else{
      ready.push(fun);
    }
  }
	
  exports.pickWhiteCard = (cards)=>{
  	var card;
  	do{
	  	if(Math.random() > this.fact){
	  		card= this.cma.pickWhiteCard();
	  	}else{
	  		card= this.cmb.pickWhiteCard();
	  	}
	  }while(cards.includes(card));
	  return card;
  };
   exports.pickBlackCard = ()=>{
  	var card;
  	do{
	  	if(Math.random() > exports.fact){
	  		card= this.cma.pickBlackCard();
	  	}else{
	  		card= this.cmb.pickBlackCard();
	  	}
	  }while(exports.pblack.includes(card));
	  if(exports.pblack.length>=15){
	  	exports.pblack.shift();
	  }
	  exports.pblack.push(card);
	  return card;
  };
  exports.pickNWhiteCards = (n,cards=[])=>{
  	out = [];
  	for(i=0;i<n;i++){
      cur = this.pickWhiteCard(cards)
  		out.push(cur);
      cards.push(cur);//avoid cards that have allready been picked
  	}
  	return out;
  };

//}
//module.exports.get = ()=>{return new multiCardMaster(new cardMaster("cust.csv"),new cardMaster("Cards_Against_Humanity.csv"),0.5);}