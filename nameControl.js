var sanitizeHtml = require('sanitize-html');
nameList = [];
exports.addName = name =>{
	empty =  RegExp('^\s*$');
	regular = RegExp(/^(\w|[\<\>\/\\:;\-\+\(\)$£%!~$]|\s)*$/);
	nameFixed = sanitizeHtml(name,{allowedTags:[]}).trim();
	out = {success:true,message:"name registered successfully",name:nameFixed}
	if(nameList.includes(nameFixed)){
		out.success = false;
		out.message = "The name you have picked already exists";
	}else if(empty.test(nameFixed)|| !(name)){
		out.success = false;
		out.message="Your name cannot be empty";
	}else if(!regular.test(nameFixed)){
		out.success = false;
		out.message = "your name must only contain regular characters";
	}else if(nameFixed.length>20){
		out.success = false;
		out.message = "your name cannot contain more than 20 characters";
	}else{
		out.success = true;
		nameList.push(nameFixed);
		if(name != nameFixed){
			out.message = "The name you picked needed to be modified";
		}else{
			out.message = "name registered successfully";
		}
	}
	return out;
};
exports.removeName = name=>{
	nameList = nameList.filter(current=>{return current!=name});
}
exports.editName = (oldname,newname)=>{
	out = this.addName(newname);
	if(oldname == out.name){
		out.message = "name not changed";
	}
	if(out.success){
		this.removeName(oldname);
	}else{
		out.name = oldname;
	}
	return out;
}