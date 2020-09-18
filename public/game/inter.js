addRow = data=>{
		out = `<div class="row" row-id="${data.id}">
						<div>${data.name}</div>
						<div>${(data.score)?data.score:"-"}</div>
						<div>${(data.status)?data.status:"-"}</div>
					</div>`;
	$(".table.scoreboard").append(out);
}
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
			$(".title.section").text(`scoreboard`);
		}else if(globalState == 1){
			if(localState == 0){
				$(".title.section").text(`Please select blue cards to fill the gap${(spaces==1)?"":"s"}`);
			}else if(localState == 1){
				$(".title.section").text(`Please wait for everyone to make their decision`);
			}else if(localState == 2){
				$(".title.section").text(`This round you will pick the winner! Please wait`);
			}
		}else if(globalState == 2){
			if(localState == 2){
				$(".title.section").text(`Now select the card you think is best`);
			}else{
				$(".title.section").text(`The winner is being picked`);
			}
		}
	};
	Server.sendMessage("globalData");
});