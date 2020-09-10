var ids =[];
var dict={};
var dictInv={};
function digit(digit){
	if(digit<10){
		return 48 + digit;
	}
	digit -= 10;
	if(digit < 26){
		return 65 + digit;
	}
	digit -= 26;
	return 97+ digit;
}

var uniq = ()=>{
		do{
			out = "";
			for(i = 0;i<12; i++){
				out += String.fromCharCode(digit(Math.round(Math.random()*61)));
			}
		}while(ids.includes(out));
		return out;
		ids.push(out);
	}

exports.gen = ()=>{
	pub = uniq();
	pri = uniq();
	dict[pub] = pri;
	dictInv[pri] = pub;
	return {privateKey:pri,publicKey:pub};
};
exports.isPub = key =>{return Object.keys(dict).includes(key)}
exports.isPri = key =>{return Object.keys(dictInv).includes(key)}
exports.pubToPri = pub =>{return dict[pub]}
exports.priToPub = pri =>{return dictInv[pri]}
exports.conv = key =>{
	if(exports.IsPub(key)){
		return exports.PubToPri(key);
	}else{
		return exports.PriToPub(key);
	}
}