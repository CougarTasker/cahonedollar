var sanitizeHtml = require('sanitize-html');

nameList = [];
exports.addName = name =>{
	empty =  RegExp('^\s*$');
	regular = RegExp(/^(\w|[\<\>\/\\:;\-\+\(\)$£%!~$]|\s)*$/);
	out = {success:true,message:"name registered successfully",name:""}
	nameFixed = sanitizeHtml(name,{allowedTags:['b', 'i', 'em', 'strong']}).trim();
	if(nameList.includes(nameFixed)){
		out.success = false;
		out.message = "The name you have picked already exists";
		out.name="";
	}else if(empty.test(nameFixed)){
		out.success = false;
		out.message="Your name cannot be empty";
		out.name="";
	}else if(!regular.test(nameFixed)){
		out.success = false;
		out.message = "your name must only contain regular characters";
		out.name = "";
	}else{
		out.success = true;
		nameList.push(nameFixed);
		if(name != nameFixed){
			out.message = "The name you picked needed to be modified";
		}else{
			out.message = "name registered successfully";
		}
		out.name = nameFixed;
	}
	return out;
};
exports.removeName = name=>{
	nameList = nameList.filter(current=>{return current!=name});
}
exports.editName = (oldname,newname)=>{
	out = this.addName(newname);
	if(oldname == out.name){
		out.message == "name not changed";
	}
	if(out.success){
		this.removeName(oldname);
	}
	return out;
}