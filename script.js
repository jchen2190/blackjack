const kinds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King', 'Ace'];
const suits = ['Diamonds', 'Hearts', 'Spades', 'Clubs'];
const deck = [];

kinds.forEach(kind => {
    suits.forEach(suit => {
        let name = `${kind} of ${suit}`;
        let file = `${kind}-of-${suit}.png`;
        let valu = 0;

        if(kind.length == 3) {
            valu = 11; // Ace
        } else if(kind.length >= 4) {
            valu = 10; // J Q K
        } else {
            valu = kind;
        }
        const card = {name:name, file:file, kind:kind, suit:suit, valu:valu};
        deck.push(card);
    });
});

const shoe = [...deck, ...deck, ...deck, ...deck, ...deck, ...deck];

// Fisher-Yates Shuffle 
shoe.forEach((e,i,a) => {
    let r = Math.floor(Math.random() * a.length);
    a[i] = a[r];
    a[r] = e;
});

const dealBtn = document.getElementById('deal-btn');
dealBtn.addEventListener('click', deal);
const hitBtn = document.getElementById('hit-btn');
hitBtn.addEventListener('click', hit);
const standBtn = document.getElementById('stand-btn');
standBtn.addEventListener('click', stand);

const promptH3 = document.getElementById('prompt');
const playerCardsDiv = document.getElementById('player-cards-div');
const dealerCardsDiv = document.getElementById('dealer-cards-div');
const playerScoreDiv = document.getElementById('player-score-div');
const dealerScoreDiv = document.getElementById('dealer-score-div');

let dealCounter = 0;
let playerHand = [];
let dealerHand = [];
let playerScore = 0;
let dealerScore = 0;
let playerAceScore = 0;
let dealerAceScore = 0;
let holeCard;
let chipsBet = 0;

const betMenu = document.getElementById('bet-menu');
betMenu.addEventListener("change", bet);
const chipsBetDiv = document.getElementById('chips-bet-div');
const chipsWonDiv = document.getElementById('chips-won-div');
const chipsDisplay = document.getElementById('chips-display');
let chips = 1000;
chipsDisplay.innerHTML = "Chips: $" + chips;

function bet() {
    chipsDisplay.innerHTML = "Chips: $" + chips; 
    chipsBet = Number(betMenu.value);
    chipsBetDiv.innerHTML = "";
    let indx = betMenu.selectedIndex;
    let optn = betMenu.options[indx];
    let chipsData = optn.dataset.chips;
    let chipsArray = chipsData.split('&');
    let chipIndx = 0;
    let leftPos = 0;

    chipInterval = setInterval(() => {
        let chip = chipsArray[chipIndx];
        let chipImg = new Image();
        chipImg.src = `images/chips/chip-${chip}.png`
        chipImg.style.zIndex = chipIndx + "";
        chipImg.style.position = "absolute";
        chipImg.style.left = (leftPos) + "px";
        chipImg.style.width = "100px";
        chipImg.style.height = "100px";
        chipsBetDiv.appendChild(chipImg);
        leftPos += 60;
        chipIndx++;
        if(chipIndx == chipsArray.length) {
            clearInterval(chipInterval);
        }
    }, 150)
}

function deal() {
    dealBtnDisable();
    dealCounter = 0;
    playerScore = 0;
    dealerScore = 0;
    playerCardsDiv.innerHTML = "";
    dealerCardsDiv.innerHTML = "";
    playerScoreDiv.innerHTML = 'Player Score: 0';
    dealerScoreDiv.innerHTML = 'Dealer Score: 0';
    promptH3.innerHTML = "";
    playerHand = [];
    dealerHand = [];
    playerAceScore = 0;
    dealerAceScore = 0;
    
    let dealInterval = setInterval(() => {
        dealCounter++;
        let pic = new Image();
        let card = shoe.pop();

        if(dealCounter == 4) {
            clearInterval(dealInterval);
        }
        if(dealCounter != 2) {
            pic.src = `images/cards/${card.file}`;
        } else {
            pic.src = `images/cards/0-Back-of-Card-Red.png`;
        }

       if(dealCounter % 2 == 1) { // player card
            playerCardsDiv.appendChild(pic);
            playerHand.push(card);
            if(card.kind == "Ace") {
                if(playerAceScore == 11) { 
                    playerAceScore = 12; 
                    card.valu = 1;
                } else {
                    playerAceScore = 11;
                }
            }
            playerScore += card.valu;
        } else { // dealer card
            pic.style.width = "105px";
            pic.style.height = "auto";
        
            dealerCardsDiv.appendChild(pic);
            dealerHand.push(card);

            if(card.kind == "Ace") {
                if(dealerAceScore == 11) {
                    dealerAceScore = 12;
                    card.valu = 1;
                } else {
                    dealerAceScore = 11;
                }
            }
            dealerScore += card.valu;
        }

        if(dealCounter == 4) {
            dealerScoreDiv.innerHTML = "Dealer Shows: " + dealerHand[1].valu;
            playerScoreDiv.innerHTML = "Player Score: " + playerScore;
            holeCard = document.getElementById("dealer-cards-div").children[0];
           
            setTimeout(() => {             
                if(playerScore == 21 && dealerScore == 21) {
                    promptH3.innerHTML = "BOTH have BLACKJACK! It's a PUSH!";
                    holeCard.src = `images/cards/${dealerHand[0].file}`; card
                    declareWinner()

                } else if(playerScore == 21) {
                    promptH3.innerHTML = "BLACKJACK! 1:1.5 PAYOUT";
                    holeCard.src = `images/cards/${dealerHand[0].file}`;
                    chips += Number(betMenu.value) * 1.5;
                    holeCard.src = `images/cards/${dealerHand[0].file}`;
                    dealerScoreDiv.innerHTML = "Dealer Score: " + dealerScore;
                    dealBtnEnable();
                    chipsDisplay.innerHTML = "Chips: $" + chips;

                } else if(dealerScore == 21) {
                    promptH3.innerHTML = "Dealer has BLACKJACK! You LOSE!";
                    holeCard.src = `images/cards/${dealerHand[0].file}`;
                    declareWinner()     

                } else {
                    hitBtnEnable();
                    standBtnEnable();
                    promptH3.innerHTML = "Hit or Stand..?";
                }
            }, 800);
        }
    }, 500);
}

function hit() {
    hitBtnDisable();
    const card = shoe.pop();
    const pic = new Image();
    pic.src = `images/cards/${card.file}`;
    playerCardsDiv.appendChild(pic);
    playerHand.push(card);

    if(card.kind == "Ace") {
        if(playerScore < 11) {
            playerScore += 11;
            playerAceScore = 11;
        } else {
            playerScore++;
            playerAceScore++;
        }
        hitBtnEnable();
    } else {
        playerScore += card.valu;
        playerScoreDiv.innerHTML = "Player Score: " + playerScore;

        if(playerScore > 21) {
            if (playerAceScore >= 11) {
                setTimeout(() => {
                    playerAceScore -= 10;
                    playerScore -= 10;
                    playerScoreDiv.innerHTML = "Player Score: " + playerScore;
                    hitBtnEnable();
                }, 700)
            } else {
                    promptH3.textContent = "BUSTED!";
                    standBtnDisable();
                    declareWinner()             
            }
        } else if (playerScore == 21) {
            setTimeout(() => {
                standBtnDisable();
                stand();
            }, 700)
        } else {
            promptH3.textContent = "Hit or Stand..?";
            hitBtnEnable();
        }
    }
    playerScoreDiv.innerHTML = "Player Score: " + playerScore;
}

function stand() {
    hitBtnDisable();
    standBtnDisable();
    setTimeout(() => {
        holeCard.src = `images/cards/${dealerHand[0].file}`;
        promptH3.innerHTML = "Dealer has " + dealerScore;
        dealerScoreDiv.innerHTML = "Dealer Score: " + dealerScore;
    }, 1200)
    setTimeout(() => {
        if(dealerScore < 17) {
            hitDealer();
        } else {
            declareWinner();
        }
    }, 1100)
}

function hitDealer() {
    setTimeout(() => {
        let card = shoe.pop();
        let pic = new Image();
        pic.src = `images/cards/${card.file}`
        dealerCardsDiv.appendChild(pic);
        dealerHand.push(card);
        
        if(card.kind == "Ace") { 
            if(dealerScore > 21 && dealerAceScore >= 11) {
                dealerAceScore++;
                card.valu = 1;
            } else {
                dealerAceScore += 11;
            }
            dealerScore += card.valu;

            if(dealerScore > 21 && dealerAceScore > 10) {
                dealerAceScore -= 10;
                dealerScore -= 10;
                dealerScoreDiv.innerHTML = "Dealer Score: " + dealerScore;
            }
            stand();
        } else {
            dealerScore += card.valu;
            if(dealerScore > 21 && dealerAceScore > 10) {
                dealerAceScore -= 10;
                dealerScore -= 10;
                dealerScoreDiv.innerHTML = "Dealer Score: " + dealerScore;
                stand();
            } else {
                promptH3.innerHTML = "Dealer has " + dealerScore;
                dealerScoreDiv.innerHTML = "Dealer Score: " + dealerScore;
                stand();
            }
        }
    }, 1000)
}

function declareWinner() {
    setTimeout(() => {
        if(playerScore > 21) {
            promptH3.innerHTML = "You lose!";
            awardChips(false)
        } else if(dealerScore > 21) {
            promptH3.innerHTML = "You win! Congrats!"
            awardChips(true)
        } else if(playerScore > dealerScore) {
            promptH3.innerHTML = "You win! Congrats!";
            awardChips(true)
        } else if (playerScore < dealerScore) {
            promptH3.innerHTML = "Sorry! You lose!";
            awardChips(false)
        } else {
            promptH3.innerHTML = "It's a Push!";
        }
        holeCard.src = `images/cards/${dealerHand[0].file}`;
        dealerScoreDiv.innerHTML = "Dealer Score: " + dealerScore;
        dealBtnEnable();
    }, 1000)
}

function awardChips(win) {
    if(win) {
        chips += Number(betMenu.value);
    } else {
        chips -= Number(betMenu.value);
    }
    chipsDisplay.innerHTML = "Chips: $" + chips;
}

function dealBtnEnable() {
    dealBtn.disabled = false;
    dealBtn.classList.remove('disabled-btn');
    dealBtn.classList.add('enabled-btn');
    betMenu.disabled = false;
}

function dealBtnDisable() {
    dealBtn.disabled = true;
    dealBtn.classList.remove('enabled-btn');
    dealBtn.classList.add('disabled-btn');
    betMenu.disabled = true;
}

function hitBtnEnable() {
    hitBtn.disabled = false;
    hitBtn.classList.remove('disabled-btn');
    hitBtn.classList.add('enabled-btn');
}

function hitBtnDisable() {
    hitBtn.classList.remove('enabled-btn');
    hitBtn.classList.add('disabled-btn');
    hitBtn.disabled = true;
}

function standBtnEnable() {
    standBtn.classList.remove('disabled-btn');
    standBtn.classList.add('enabled-btn');
    standBtn.disabled = false;
}

function standBtnDisable() {
    standBtn.classList.remove('enabled-btn');
    standBtn.classList.add('disabled-btn');
    standBtn.disabled = true;
}