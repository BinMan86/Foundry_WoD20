roll();

async function roll() {

    let selector = "";

    for (let i = 3; i <= 10; i++) {
        if (i == 6) {
            selector += `<input type="radio" id="inputDif" name="inputDif" value="${i}" checked>${i}</input>`;
        }
        else {
            selector += `<input type="radio" id="inputDif" name="inputDif" value="${i}">${i}</input>`;
        }
    }

    let buttons = {};
    let template = `<form>
                        <div class="form-group">
                            <label>${game.i18n.localize("wod.labels.numdices")}</label>
                            <input type="text" id="dices" value="0">
                        </div>  
                        <div class="form-group">
						<label>${game.i18n.localize("wod.labels.difficulty")}</label>
						`
						+ selector + 
						`
                        </div> 
                        <div class="form-group">
                            <input id="specialty" type="checkbox">${game.i18n.localize("wod.labels.specialty")}</input>
                        </div>
					</div>
                    </form>`;

    buttons = {
        draw: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("wod.dice.roll"),
            callback: async (template) => {
                const dice = template.find("#dices")[0]?.value;
                let difficulty = parseInt(template.find("#inputDif:checked")[0]?.value || 0);
                const specialty = template.find("#specialty")[0]?.checked || false;
                let successes = 0;
                let label = "";
                let dicesRolled = "";
                let rolledOne = false;
                let successRoll = false;
                let rolledAnySuccesses = false;
                let handlingOnes = true;

                try {
                    handlingOnes = game.settings.get('worldofdarkness', 'theRollofOne');
                } 
                catch (e) {
                    handlingOnes = true;
                }

                roll = new Roll(dice + "d10");
                roll.evaluate({async:true});

                let diceColor;

                diceColor = "black_";
                
                roll.terms[0].results.forEach((dice) => {
                    if ((dice.result == 10) && (specialty)) {
                        successes += 2;
                        rolledAnySuccesses = true;
                    }
                    else if (dice.result >= difficulty) {
                        successes++;
                        rolledAnySuccesses = true;
                    }
                    else if (dice.result == 1) {
                        if (handlingOnes) {
                            successes--;
                        }

                        rolledOne = true;
                    }

                    dicesRolled += `<img src="systems/worldofdarkness/assets/img/dice/${diceColor}${dice.result}.png" class="rolldices" />`;
                });

                if (successes < 0) {
                    successes = 0;
                }

                successRoll = successes > 0;

                if (successRoll) {
                    difficultyResult = `( <span class="success">${game.i18n.localize("wod.dice.success")}</span> )`;
                }
                else if ((handlingOnes) && (rolledOne) && (!rolledAnySuccesses)) {
                    difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.botch")}</span> )`;
                }
                else if ((!handlingOnes) && (rolledOne)) {
                    difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.botch")}</span> )`;
                }
                else {
                    difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.fail")}</span> )`;
                }

                difficulty = `<span>${game.i18n.localize("wod.labels.difficulty")}: ${difficulty}</span><br />`;
                
                label += `<p class="roll-label result-success">${difficulty} ${game.i18n.localize("wod.dice.successes")}: ${successes} ${difficultyResult}</p>`;

                if (specialty) {
                    label += `<p class="roll-label result-success">Speciality used</p>`;
                }

                printMessage('<h2>Rolling Dice</h2>' + label + dicesRolled);
            },
        },
        cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("wod.labels.cancel"),
        },
    };

    new Dialog({      
        title: game.i18n.localize("wod.labels.rolling"),
        content: template,
        buttons: buttons,
        default: "draw",
    }).render(true);    
}

function printMessage(message) {
    let chatData = {
        content : message,
        speaker : ChatMessage.getSpeaker({ actor: this.actor })
    };		

    ChatMessage.create(chatData,{});
}