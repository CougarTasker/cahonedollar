addRow = data=>{
			out = `	<div row-id="${data.id}" col-id="name">${data.name}</div>
					<div row-id="${data.id}" col-id="score">${(data.highScore)?data.highScore:"-"}</div>`;
		$(".table.player-list").append(out);
	}
Server.ready(()=>{
		var nameCommit = ()=>{
			Server.sendMessage("name",$("#name").val());
		};
		$("#submit").click(nameCommit);
		$("#name").on('keypress',function(e) {
			if(e.which == 13) {
				nameCommit();
			}
		});
	Server.addReceiveMessageHandler("name",res=>{
		$("#name").val(res.name); 
		if(!res.success){
			$("#name~.tooltiptext").text(res.message);
			$("#name").addClass("invalid");
			setTimeout(()=>{
				$("#name").removeClass("invalid");
			},1500);
		}else{
			$("#name").removeClass("invalid");
		}
	});
	Server.addReceiveMessageHandler("removePlayer",playerID=>{
		$("[row-id=\""+playerID+"\"]").remove();
	});
	Server.sendMessage("getList");
	Server.addReceiveMessageHandler("receiveList",list=>{
		for(row of list){
			addRow(row);
		}
	});
	Server.addReceiveMessageHandler("addPlayer",addRow);
	Server.addReceiveMessageHandler("editName",data=>{
		$(`[row-id="${data.id}"][col-id="name"]`).text(data.name);
	});
	Server.addReceiveMessageHandler("myData",data=>{
		$("#name").val(data.name);
		$("#highScore").text((data.highScore)?data.highScore:"-");
		$("#gamesPlayed").text((data.gamesPlayed)?data.gamesPlayed:"-");
		$("#gamesWon").text((data.gamesWon)?data.gamesWon:"-");
	});
	Server.sendMessage("myData");
});