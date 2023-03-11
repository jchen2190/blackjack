const kinds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King', 'Ace'];
const suits = ['Diamonds', 'Hearts', 'Spades', 'Clubs'];
const deck = [];

// make cards in a deck
kinds.forEach(kind => {
    suits.forEach(suit => {
        // let kind = kinds[k];
        // let suit = suits[s];
        let name = `${kind} of ${suit}`;
        let file = `${kind}-of-${suit}.png`;
        let valu = 0;

        if(kind.length == 3) {
            valu = 11; // Ace
        } else if(kind.length >= 4) {
            valu = 10; // face card
        } else {
            valu = kind;
        }
        const card = {name:name, file:file, kind:kind, suit:suit, valu:valu}; // assign all values to "card"
        deck.push(card);
    });
});

// Shoe consisting of 6 decks of cards
const shoe = [...deck, ...deck, ...deck, ...deck, ...deck, ...deck];

shoe.sort(() => Math.random() - 0.5);

// Fisher-Yates Shuffle 
for(let i = 0; i < shoe.length; i++) {
    let temp = shoe[i];
    let r = Math.floor(Math.random() * shoe.length);
    shoe[i] = shoe[r];
    shoe[r] = temp;
}
// Fisher-Yates Shuffle using forEach
shoe.forEach((e,i,a) => {
    let r = Math.floor(Math.random() * a.length);
    a[i] = a[r];
    a[r] = e;
});

// buttons
const dealBtn = document.getElementById('deal-btn');
dealBtn.addEventListener('click', deal);
const hitBtn = document.getElementById('hit-btn');
hitBtn.addEventListener('click', hit);
const standBtn = document.getElementById('stand-btn');
standBtn.addEventListener('click', stand);

const promptH2 = document.querySelector('h2');
const playerCardsDiv = document.getElementById('player-cards-div');
const dealerCardsDiv = document.getElementById('dealer-cards-div');
const playerScoreDiv = document.getElementById('player-score-div');
const dealerScoreDiv = document.getElementById('dealer-score-div');

let dealCounter = 0;
let playerHand = []; // hold cards
let dealerHand = [];
let playerScore = 0;
let dealerScore = 0;
// keep track of player and dealer Ace scores
let playerAceScore = 0;
let dealerAceScore = 0;
let holeCard;

function deal() {
    // reset
    dealBtn.disabled = true;
    dealBtn.classList.remove('enabled-btn');
    dealBtn.classList.add('disabled-btn');   
    dealCounter = 0;
    playerScore = 0;
    dealerScore = 0;
    playerCardsDiv.innerHTML = "";
    dealerCardsDiv.innerHTML = "";
    playerScoreDiv.innerHTML = 'Player Score: 0';
    dealerScoreDiv.innerHTML = 'Dealer Score: 0';
    promptH2.innerHTML = "";
    playerHand = [];
    dealerHand = [];
    playerAceScore = 0;
    dealerAceScore = 0;
    
    let dealInterval = setInterval(() => {
        dealCounter++;
        let pic = new Image(); // instantiate image to each new card
        let card = shoe.pop(); // card popped is saved to new card

        if(dealCounter == 4) {
            clearInterval(dealInterval); // stop dealing after 4 cards
        }
        if(dealCounter != 2) { // If not 2nd card
            pic.src = `images/cards/${card.file}`;
        } else {
            pic.src = `images/cards/0-Back-of-Card-Red.png`; // face down card
        }

       // the 1st or 3rd card, which goes to the player
       if(dealCounter % 2 == 1) {
            playerCardsDiv.appendChild(pic);
            playerHand.push(card);
            if(card.kind == "Ace") {
                if(playerAceScore == 11) { 
                    playerAceScore = 12; 
                    card.valu = 1; // increment player score by 1
                } else {
                    playerAceScore = 11; // first ace counts 11
                }
            }
            playerScore += card.valu;
        } else {
            // make cards appear farther away
            pic.style.width = "105px";
            pic.style.height = "auto";
        
            dealerCardsDiv.appendChild(pic);
            dealerHand.push(card);

            if(card.kind == "Ace") {
                if(dealerAceScore == 11) {  // if dealer already has an Ace
                    dealerAceScore = 12;
                    card.valu = 1; // second Ace counts as 1 = 12
                } else {
                    dealerAceScore = 11; // first ace counts 11
                }
            }
            dealerScore += card.valu;

            // Test Blackjack
            // dealerScore = 21;
            // playerScore = 21;
        }

        if(dealCounter == 4) { // when finish dealing
            dealerScoreDiv.innerHTML = "Dealer Shows: " + dealerHand[1].kind;
            playerScoreDiv.innerHTML = "Player Score: " + playerScore;

            // save the first dealer card -- the hidden "hole card" to a variable
            // .children[0] returns the first child element inside the parent element
            holeCard = document.getElementById("dealer-cards-div").children[0];
           
            setTimeout(() => {             
                // if anyone has BLACKJACK, the game is over
                if(playerScore == 21 && dealerScore == 21) { // first check if BOTH have BLACKJACK
                    promptH2.innerHTML = "BOTH have BLACKJACK! It's a PUSH!";
                    holeCard.src = `images/cards/${dealerHand[0].file}`; // reveal dealer card
                    declareWinner()

                } else if(playerScore == 21) { // if player has blackjack (21)
                    promptH2.innerHTML = "BLACKJACK!";
                    holeCard.src = `images/cards/${dealerHand[0].file}`; // reveal dealer card
                    declareWinner()

                } else if(dealerScore == 21) { // if dealer has blackjack (21)
                    promptH2.innerHTML = "Dealer has BLACKJACK! You LOSE!";
                    holeCard.src = `images/cards/${dealerHand[0].file}`; // reveal dealer card
                    declareWinner()
                    
                } else { // no one has blackjack                 
                    hitBtn.classList.remove('disabled-btn');
                    standBtn.classList.remove('disabled-btn');
                    hitBtn.disabled = false;
                    standBtn.disabled = false;
                    hitBtn.classList.add('enabled-btn');
                    standBtn.classList.add('enabled-btn');

                    promptH2.innerHTML = "Hit or Stand..?";
                }
            }, 800);

        } // dealCounter == 4

    }, 800); // deal interval
}

function hit() {
    hitBtn.disabled = true; // prevent multiple clicking at once if already busted
    hitBtn.classList.add('disabled-btn');
    hitBtn.classList.remove('enabled-btn');

    const card = shoe.pop();
    const pic = new Image();
    pic.src = `images/cards/${card.file}`;
    playerCardsDiv.appendChild(pic);

    if(card.kind == "Ace") {
        if(playerScore < 11) { // if cards less than 11, add "Ace" value
            playerScore += 11;
            playerAceScore = 11;
        } else {
            playerScore++;
            playerAceScore++;
        }
        hitBtn.disabled = false;
        hitBtn.classList.remove('disabled-btn');
        hitBtn.classList.add('enabled-btn');
    } else {
        playerScore += card.valu;
        playerScoreDiv.innerHTML = "Player Score: " + playerScore;

        if(playerScore > 21) {
            if (playerAceScore >= 11) { // if player has Ace, reduce score to prevent bust
                setTimeout(() => {
                    playerAceScore -= 10;
                    playerScore -= 10;
                    playerScoreDiv.innerHTML = "Player Score: " + playerScore;
                    hitBtn.disabled = false;
                    hitBtn.classList.remove('disabled-btn');
                    hitBtn.classList.add('enabled-btn');
                }, 700)
                
            } else {
                setTimeout(() => {
                    promptH2.textContent = "BUSTED!";
                    standBtn.disabled = true;
                    standBtn.classList.add('disabled-btn');
                    standBtn.classList.remove('enabled-btn');
                    declareWinner()
                }, 700)                
            }
        } else if (playerScore == 21) { // exactly 21, go to dealer
            // promptH2.textContent = "You have 21! Dealer's turn!";
            setTimeout(() => {
                stand();
            }, 700)
            
        } else {
            promptH2.textContent = "Hit or Stand..?";
            hitBtn.disabled = false;
            hitBtn.classList.remove('disabled-btn');
            hitBtn.classList.add('enabled-btn');
        }
    }
    playerScoreDiv.innerHTML = "Player Score:" + playerScore; // update score
}

function stand() {
    // disable buttons when player stands
    hitBtn.classList.remove('enabled-btn');
    standBtn.classList.remove('enabled-btn');
    hitBtn.classList.add('disabled-btn');
    standBtn.classList.add('disabled-btn');
    hitBtn.disabled = true;
    standBtn.disabled = true;

    setTimeout(() => { // Dealer reveal card + show score
        holeCard = document.getElementById("dealer-cards-div").children[0];
        holeCard.src = `images/cards/${dealerHand[0].file}`;
        promptH2.innerHTML = "Dealer has " + dealerScore;
        dealerScoreDiv.innerHTML = "Dealer Score:" + dealerScore;
    }, 1200)

    setTimeout(() => { // if dealer hits or not
        if(dealerScore < 17) {
            // promptH2.innerHTML = "Dealer must hit on " + dealerScore;
            hitDealer();
        // add this for dealer to hit on Soft 17
        // } else if (dealerScore ==  17) { 
        //     if(dealerAceScore >= 11) {
        //         dealerAceScore -= 10;
        //         dealerScore -= 10;
        //         promptH2.innerHTML = "Dealer must hit on Soft 17";
        //         hitDealer();
        //     } else {
        //         promptH2.innerHTML = "Dealer stands on Hard " + dealerScore;
        //         declareWinner();
        //     }
        } else {
            // promptH2.innerHTML = "Dealer stands on " + dealerScore;
            declareWinner();
        }
    }, 1000)
}

function hitDealer() {
    setTimeout(() => {
        let card = shoe.pop();
        let pic = new Image();
        pic.src = `images/cards/${card.file}`
        dealerCardsDiv.appendChild(pic);
        dealerHand.push(card);
        
        if(card.kind == "Ace") { 
            if(dealerScore > 21 && dealerAceScore >= 11) {  // if dealer already has an Ace
                dealerAceScore = 12;
                card.valu = 1; // additional Ace counts as 1 = 12
            } else {
                dealerAceScore = 11; // ace counts 11
            }

            dealerScore += card.valu;
            if(dealerScore > 21 && dealerAceScore > 10) { // if dealer has Ace that will bust him
                dealerAceScore -= 10;
                dealerScore -= 10;
                dealerScoreDiv.innerHTML = "Dealer Score:" + dealerScore;
            }
            stand();
            // if (dealerScore < 17 ) { // add this if dealer hits on soft 17--> || (dealerScore == 17 && dealerAceScore >= 11)
            //     // promptH2.innerHTML = "Dealer has" + dealerScore;
            //     // dealerScoreDiv.innerHTML = "Dealer Score:" + dealerScore;
            //     hitDealer();
            // } else {
            //     stand();
            // }
        } else { // card that is not an Ace
            dealerScore += card.valu;
            if(dealerScore > 21 && dealerAceScore > 10) { // if dealer has previous Ace is hand
                dealerAceScore -= 10;
                dealerScore -= 10;
                dealerScoreDiv.innerHTML = "Dealer Score:" + dealerScore;
                stand();
            } else {
                promptH2.innerHTML = "Dealer has " + dealerScore;
                dealerScoreDiv.innerHTML = "Dealer Score:" + dealerScore;
                stand();
            }
        }
    }, 1000)
}

function declareWinner() {
    setTimeout(() => {
        if(playerScore > 21) {
            promptH2.innerHTML = "You lose!";
        } else if(dealerScore > 21) {
            promptH2.innerHTML = "You win! Congrats!"
        } else if(playerScore > dealerScore) {
            promptH2.innerHTML = "You win! Congrats!";
        } else if (playerScore < dealerScore) {
            promptH2.innerHTML = "Sorry! You lose!";
        } else {
            promptH2.innerHTML = "It's a Push!";
        }
        holeCard.src = `images/cards/${dealerHand[0].file}`;
        dealerScoreDiv.innerHTML = "Dealer Score:" + dealerScore;
        dealBtn.disabled = false;
        dealBtn.classList.remove('disabled-btn');
        dealBtn.classList.add('enabled-btn');
    }, 1000)
       
}