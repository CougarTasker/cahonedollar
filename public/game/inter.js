cardText = card =>`<div class="card noselect" card-id="${card.id}">${card.text}</div>`;
combCardText = card =>`<div class="combCard noselect" card-id="${card.id}"></div>`;



Server.ready(()=>{
	addWhiteCard = card=>{
		dom = $(cardText(card));
		if(card.text.length > 70){
			$("body").css("font-size",14);
		}
		dom.click((event)=>{
			if($(event.currentTarget).hasClass("selected")){
				Server.sendMessage("selectedCardsRemove",$(event.currentTarget).attr("card-id"));
			}else{
				Server.sendMessage("selectedCardsAdd",$(event.currentTarget).attr("card-id"));
			}
		});
		$(".black.half").append(dom);
	}
	Server.addReceiveMessageHandler("whiteCards",cards=>{
		
		$(".black.half>.card").remove();//remove any existing cards;
		cards.forEach(addWhiteCard);
	});
	Server.addReceiveMessageHandler("whiteCardsAdd",(cards)=>cards.forEach(addWhiteCard));
	Server.addReceiveMessageHandler("whiteCardsRemove",cards=>{
		cards.forEach(card=>$(`.black.half>.card[card-id="${card.id}"]`).remove())
	});
	Server.addReceiveMessageHandler("selectedCards",cards=>{
		$(".black.half>.card.selected").removeClass("selected");
		cards.forEach(card=>{
			$(`.black.half>.card[card-id="${card.id}"]`).addClass("selected");
		});
	})
	Server.addReceiveMessageHandler("selectedCardsAdd",card=>{
		$(`.black.half>.card[card-id="${card.id}"]`).addClass("selected");
	});
	Server.addReceiveMessageHandler("selectedCardsRemove",card=>{
		$(`.black.half>.card[card-id="${card.id}"]`).removeClass("selected");
	});
	localState = 0;
	Server.addReceiveMessageHandler("localState",state=>{
		localState = state
		updateCover();
	});
	Server.sendMessage("localData");


	var spaces = 1;
	Server.addReceiveMessageHandler("blackCard",card=>{
		$(".white.half>.card.blackCard").remove();//remove any existing cards;
		$(".white.half").append($(cardText(card)).addClass("blackCard"));
		spaces = card.spaces;
	});
	addCombCard = combCard=>{
			$("#combWrapper").append(combCardText(combCard));
			holder = $(`#combWrapper>.combCard[card-id="${combCard.id}"]`);
			combCard.cards.forEach(subcard=>{
				holder.append(cardText(subcard));
			});
			holder.click((event)=>{
				Server.sendMessage("combCardsSelect",$(event.currentTarget).attr("card-id"));
			});
	}
	Server.addReceiveMessageHandler("combCards", cards=>{
		$("#combWrapper>*").remove();//remove any existing cards;
		cards.forEach(addCombCard);
	});
	Server.addReceiveMessageHandler("combCardsAdd",addCombCard);
	Server.addReceiveMessageHandler("win",()=>{
		confetti.start();
		setTimeout(()=>{confetti.stop();},3000);
	});
	globalState = 0;
	Server.addReceiveMessageHandler("gameState",state=>{
		globalState = state
		updateCover();
	});
	updateCover = ()=>{
		if(localState == 0){
			$(".black").removeClass("invalid");
		}else{
			$(".black").addClass("invalid");
		}

		if(globalState == 2){
			$("#combWrapper").addClass("show");
			if(localState == 2){
				$("#combWrapper").addClass("pick");
			}
		}else{
			$("#combWrapper").removeClass("show").removeClass("pick");
		}
		if(globalState == 0){
			$(".half .title.section").text(`Scoreboard`);
			$(".whole").addClass("show");
			$(".half").addClass("hide");
		}else if(globalState == 1){
			$(".whole").removeClass("show");
			$(".half").removeClass("hide");
			if(localState == 0){
				$(".half .title.section").text(`Please select blue cards to fill the gap${(spaces==1)?"":"s"}`);
			}else if(localState == 1){
				$(".half .title.section").text(`Please wait for everyone to make their decision`);
			}else if(localState == 2){
				$(".half .title.section").text(`This round you will pick the winner! Please wait`);
			}
		}else if(globalState == 2){
			$(".half").removeClass("hide");
			$(".whole").removeClass("show");
			if(localState == 2){
				$(".half .title.section").text(`Now select the card you think is best`);
			}else{
				$(".half .title.section").text(`The winner is being picked`);
			}
		}
	};


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
	 sound = new Audio("/game/11sec.mp3");
	 soundTime = null
	Server.addReceiveMessageHandler("timeInterval",interval=>{
		sound.stop();
		tl = interval.end- Date.now();
		clearTimeout(soundTime);
		length = 11*1000
		if(tl>length && interval.duration > 2 * length){
			soundTime = setTimeout(function(sound){
				sound.play();
			},tl-11*1000,sound);
		}
	});
	Server.sendMessage("globalData");
});