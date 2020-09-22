addRow = data=>{
			out = `	<div class="${(data.winner)?"winner":""}" row-id="${data.id}" col-id="name"		>${data.name}</div>
					<div class="${(data.winner)?"winner":""}" row-id="${data.id}" col-id="score"	>${(data.score != null && data.score != undefined)?		data.score 				:"-"}</div>
					<div class="${(data.winner)?"winner":""}" row-id="${data.id}" col-id="status"	>${(data.status != null && data.status != undefined)?	statusMap[data.status]	:"-"}</div>
					`;
		$(".table.scoreboard").append(out);
	}
statusMap = {
	0:`<span class="material-icons">hourglass_empty	</span>`,
	1:`<span class="material-icons">done			</span>`,
	2:`<span class="material-icons">leaderboard		</span>`
}
Server.ready(()=>{
		// var nameCommit = ()=>{
		// 	Server.sendMessage("name",$("#name").val());
		// };
		// $("#submit").click(nameCommit);
		// $("#name").on('keypress',function(e) {
		// 	if(e.which == 13) {
		// 		nameCommit();
		// 	}
		// });
	// Server.addReceiveMessageHandler("name",res=>{
	// 	$("#name").val(res.name); 
	// 	if(!res.success){
	// 		$("#name~.tooltiptext").text(res.message);
	// 		$("#name").addClass("invalid");
	// 		setTimeout(()=>{
	// 			$("#name").removeClass("invalid");
	// 		},1500);
	// 	}else{
	// 		$("#name").removeClass("invalid");
	// 	}
	// });
	Server.addReceiveMessageHandler("scoreboardRemove",playerID=>{
		$(".scoreboard [row-id=\""+playerID+"\"]").remove();
	});
	
	Server.addReceiveMessageHandler("scoreboard",scoreboard=>{
		for(row of scoreboard){
			addRow(row);
		}
	});
	Server.addReceiveMessageHandler("scoreboardAdd",addRow);
	Server.addReceiveMessageHandler("scoreboardStatusChange",data=>{
		$(`.scoreboard [row-id="${data.id}"][col-id="status"]`).html(statusMap[data.status]);
	});
	Server.addReceiveMessageHandler("scoreboardWinner",id=>{
		cell = $(`.scoreboard [row-id="${id}"][col-id="score"]`)
		val = parseInt(cell.text())
		val = val==NaN?0:val;
		cell.text(val+1);
		$(`.scoreboard [col-id="score"]`).toArray().map(elm=>{return {id:$(elm).attr("row-id"),score:$(elm).text()}}).sort((a,b)=>a.score-b.score).reverse().map(row=>row.id).forEach(rowID=>{
			$(`.scoreboard`).append($(`.scoreboard [row-id="${rowID}"]`));
		});
		$(`.scoreboard .winner`).removeClass("winner");//swap the winner class
		$(`.scoreboard [row-id="${id}"]`).addClass("winner");
	})
	// Server.addReceiveMessageHandler("editName",data=>{
	// 	$(`[row-id="${data.id}"][col-id="name"]`).text(data.name);
	// });
	Server.sendMessage("scoreboard");
});