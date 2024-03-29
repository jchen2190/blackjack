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
standBtn.addEventListener('click', beforeStand);
const dblBtn = document.getElementById('double-btn');
dblBtn.addEventListener('click', () => {
    dblDown = true;
    doubleDown();
});

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
let dblDown = false;

const betMenu = document.getElementById('bet-menu');
betMenu.addEventListener("change", bet);
const chipsBetDiv = document.getElementById('chips-bet-div');
const chipsWonDiv = document.getElementById('chips-won-div');
const chipsDisplay = document.getElementById('chips-display');
let chips = 1000;
chipsDisplay.innerHTML = "Chips: $" + chips;

let chipAudio = new Audio("./audio/pokerchip.wav");
let cardDealAudio = new Audio("./audio/card-deal.wav");
let cardFlipAudio = new Audio("./audio/card-flip.wav");

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

    chipAudio.play();
    chipInterval = setInterval(() => {
        let chip = chipsArray[chipIndx];
        let chipImg = new Image();
        chipImg.src = `images/chips/chip-${chip}.png`
        chipImg.style.zIndex = chipIndx + "";
        chipImg.style.position = "absolute";
        chipImg.style.left = (leftPos) + "px";
        chipImg.style.width = "80px";
        chipImg.style.height = "80px";
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
    chipsBet = Number(betMenu.value);
    dealCounter = 0;
    playerScore = 0;
    dealerScore = 0;
    playerCardsDiv.innerHTML = "";
    dealerCardsDiv.innerHTML = "";
    playerScoreDiv.innerHTML = '0';
    dealerScoreDiv.innerHTML = '0';
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
            pic.style.width = "90px";
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
            dealerScoreDiv.innerHTML = dealerHand[1].valu;
            playerScoreDiv.innerHTML = playerScore;
            holeCard = document.getElementById("dealer-cards-div").children[0];
           
            setTimeout(() => {             
                if(playerScore == 21 && dealerScore == 21) {
                    promptH3.innerHTML = "BOTH have BLACKJACK! It's a PUSH!";
                    holeCard.src = `images/cards/${dealerHand[0].file}`;
                    declareWinner();

                } else if(playerScore == 21) {
                    promptH3.innerHTML = "BLACKJACK! 1:1.5 PAYOUT";
                    holeCard.src = `images/cards/${dealerHand[0].file}`;
                    chips += Number(betMenu.value) * 1.5;
                    holeCard.src = `images/cards/${dealerHand[0].file}`;
                    dealerScoreDiv.innerHTML = dealerScore;
                    dealBtnEnable();
                    chipsDisplay.innerHTML = "Chips: $" + chips;

                } else if(dealerScore == 21) {
                    promptH3.innerHTML = "Dealer has BLACKJACK! You LOSE!";
                    holeCard.src = `images/cards/${dealerHand[0].file}`;
                    declareWinner();  

                } else {
                    btnEnable(dblBtn);
                    btnEnable(hitBtn);
                    btnEnable(standBtn);
                    // hitBtnEnable();
                    // standBtnEnable();
                    promptH3.innerHTML = "Hit or Stand..?";
                }
            }, 800);
        }
    }, 500);
}

// TODO: Split Function()

function doubleDown() {
    btnDisable(hitBtn);
    btnDisable(dblBtn);
    btnDisable(standBtn);
    chipAudio.play();
    chipsBet *= 2;
    const card = shoe.pop();
    const pic = new Image();
    pic.src = `images/cards/${card.file}`;
    // pic.style.transform = "rotate(90deg)";
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
        beforeStand();
    } else {
        playerScore += card.valu;
        playerScoreDiv.innerHTML = playerScore;

        if(playerScore > 21) {
            if (playerAceScore >= 11) {
                setTimeout(() => {
                    playerAceScore -= 10;
                    playerScore -= 10;
                    playerScoreDiv.innerHTML = playerScore;
                    beforeStand();
                }, 700)
            } else {
                    promptH3.textContent = "BUSTED!";
                    declareWinner()             
            }
        } else {
            setTimeout(() => {
                beforeStand();
            }, 700)
        }
    }
    playerScoreDiv.innerHTML = playerScore;
}

function hit() {
    btnDisable(dblBtn);
    btnDisable(hitBtn);
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
        btnEnable(hitBtn);
    } else {
        playerScore += card.valu;
        playerScoreDiv.innerHTML = playerScore;

        if(playerScore > 21) {
            if (playerAceScore >= 11) {
                setTimeout(() => {
                    playerAceScore -= 10;
                    playerScore -= 10;
                    playerScoreDiv.innerHTML = playerScore;
                    btnEnable(hitBtn);
                }, 700)
            } else {
                    promptH3.textContent = "BUSTED!";
                    btnDisable(standBtn);
                    declareWinner()             
            }
        } else if (playerScore == 21) {
            setTimeout(() => {
                btnDisable(standBtn);
                beforeStand();
            }, 700)
        } else {
            promptH3.textContent = "Hit or Stand..?";
            btnEnable(hitBtn);
        }
    }
    playerScoreDiv.innerHTML = playerScore;
}

function beforeStand() { // smoother transition gameplay
    btnDisable(hitBtn);
    btnDisable(standBtn);
    setTimeout(() => {
        holeCard.src = `images/cards/${dealerHand[0].file}`;
        promptH3.innerHTML = "Dealer has " + dealerScore;
        dealerScoreDiv.innerHTML = dealerScore;
    }, 1000)
    setTimeout(() => {
        stand();
    }, 1000)
}

function stand() {
    setTimeout(() => {
        if(dealerScore < 17) {
            hitDealer();
        } else {
            declareWinner();
        }
    }, 700)
}

function hitDealer() {
    setTimeout(() => {
        let card = shoe.pop();
        let pic = new Image();
        pic.style.width = "105px";
        pic.style.height = "auto";
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
                dealerScoreDiv.innerHTML = dealerScore;
            }
            stand();
        } else {
            dealerScore += card.valu;
            if(dealerScore > 21 && dealerAceScore > 10) {
                dealerAceScore -= 10;
                dealerScore -= 10;
                dealerScoreDiv.innerHTML = dealerScore;
                stand();
            } else {
                promptH3.innerHTML = "Dealer has " + dealerScore;
                dealerScoreDiv.innerHTML = dealerScore;
                stand();
            }
        }
    }, 700)
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
        dealerScoreDiv.innerHTML = dealerScore;
        dealBtnEnable();
    }, 1000)
}

function awardChips(win) {
    if(win) {
        chips += chipsBet;
    } else {
        chips -= chipsBet;
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
function btnEnable(btn) {
    btn.disabled = false;
    btn.classList.remove('disabled-btn');
    btn.classList.add('enabled-btn');
}
function btnDisable(btn) {
    btn.disabled = true;
    btn.classList.remove('enabled-btn');
    btn.classList.add('disabled-btn');
}