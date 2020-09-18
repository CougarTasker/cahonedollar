

function Value(defult){
	this.val = defult;
	this.set = func =>{
		var old = this.get();
		var next = func(old);
		if(old != next){//if the value hasnt changed dont bother triggerting a transition
			this.val = next;
			for(handel of this.handelers){
				if(handel.test != undefined && handel.test!= null){//if there is a test conditon
					if(typeof handel.test == "function"){
						//if the test condition is a function then test it
						if(handel.test(next)){
							handel.func(next,old);
						}
					}else{
						if(handel.test == next){
							handel.func(next,old);
						}
					}
				}else{
					//if there is no condition just run the handler
					handel.func(next,old);
				}
				
			}
		}
	};
	this.handelers=[];
	this.addSetHandler = (func,test) =>{
		this.handelers.push({func:func,test:test});
	}
	this.get = ()=>{
		return JSON.parse(JSON.stringify(this.val));
	}
}
exports.create = (defult)=>{return new Value(defult);}