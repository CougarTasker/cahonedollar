

function Value(defult){
	this.val = defult;
	this.set = func =>{
		var old = this.get();
		var next = this.copy(func(old));
		this.val = next;
		for(handel of this.handelers){
			if(handel.test){//if there is a test conditon
				if(typeof handel.test == "function"){
					//if the test condition is a function then test it
					if(handel.test(next)){
						handel.func(old,next);
					}
				}else{
					if(handel.test == next){
						handel.func(old,next);
					}
				}
			}else{
				//if there is no condition just run the handler
				handel.func(old,next);
			}
			
		}
	};
	this.handelers=[];
	this.addSetHandler = (func,test) =>{
		this.handelers.push({func:func,test:test});
	}
	this.get = ()=>{
		return this.copy(this.val);
	}
	this.copy = obj=>{
		if(obj){
			return JSON.parse(JSON.stringify(obj));
		}else{
			return undefined;
		}
	}
}

exports.create = (defult)=>{return new Value(defult);}