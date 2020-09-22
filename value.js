

function Value(defult){
	this.val = defult;
	this.q = [];
	this.free = true;
	this.set = func =>{
		if(this.free){
			this.runSetFunction(func);
		}else{
			this.q.push(func);
		}
	}
	this.runSetFunction = func =>{
		this.free = false;
		var old = this.get();
		var next = func(this.get());
		if(old != next){//if the value hasnt changed dont bother triggerting a transition
			this.val = next;
			for(handel of this.handelers){
				if(handel.test != undefined && handel.test!= null){//if there is a test conditon
					if(typeof handel.test == "function"){
						//if the test condition is a function then test it
						if(handel.test(next,old)){
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
		if(this.q.length > 0){
			this.runSetFunction(this.q.shift());
		}
		this.free = true;
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