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
    dealCounter = 0;
    playerScore = 0;
    dealerScore = 0;
    playerCardsDiv.innerHTML = "";
    dealerCardsDiv.innerHTML = "";
    playerScoreDiv.innerHTML = 'Player Score: 0';
    dealerScoreDiv.innerHTML = 'Dealer Score: 0';
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

                } else if(playerScore == 21) { // if player has blackjack (21)
                    promptH2.innerHTML = "You have BLACKJACK! You WIN!";
                    
                } else if(dealerScore == 21) { // if dealer has blackjack (21)
                    promptH2.innerHTML = "Dealer has BLACKJACK! You LOSE!";
                    holeCard.src = `images/cards/${dealerHand[0].file}`; // reveal dealer card
                    
                } else { // no one has blackjack
                    dealBtn.disabled = "true";
                    dealBtn.classList.add('disabled-btn');                    
                    hitBtn.classList.remove('disabled-btn');
                    standBtn.classList.remove('disabled-btn');
                    hitBtn.disabled = false;
                    standBtn.disabled = false;

                    promptH2.innerHTML = "Hit or Stand..?";
                }
            }, 800);

        } // dealCounter == 4

    }, 800); // deal interval
}

function hit() {
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
    } else {
        playerScore += card.valu;
        playerScoreDiv.innerHTML = "Player Score: " + playerScore;

        if(playerScore > 21) {
            if (playerAceScore >= 11) { // if player has Ace, reduce score to prevent bust
                playerAceScore -= 10;
                playerScore -= 10;
            } else {
                promptH2.textContent = "BUSTED! You LOSE!";
            }
        } else if (playerScore == 21) { // exactly 21, go to dealer
            promptH2.textContent = "You have 21! Dealer's turn!";
            stand();
        } else {
            promptH2.textContent = "Hit or Stand..?";
        }
    }
    playerScoreDiv.innerHTML = "Player Score:" + playerScore; // update score
}

function stand() {
    setTimeout(() => { // Dealer reveal card
        holeCard = document.getElementById("dealer-cards-div").children[0];
        holeCard.src = `images/cards/${dealerHand[0].file}`;
    }, 1000)
    
    setTimeout(() => { // prompts dealer score
        promptH2.innerHTML = "Dealer has " + dealerScore;
        dealerScoreDiv.innerHTML = "Dealer Score:" + dealerScore;
    }, 1000)

    setTimeout(() => { // if dealer hits or not
        if(dealerScore < 17) {
            promptH2.innerHTML = "Dealer must hit on " + dealerScore;
            hitDealer();
        } else if (dealerScore ==  17) { // dealer hit on Soft 17
            if(dealerAceScore >= 11) {
                dealerAceScore -= 10;
                dealerScore -= 10;
                promptH2.innerHTML = "Dealer must hit on Soft 17";
                hitDealer();
            } else {
                promptH2.innerHTML = "Dealer stands on Hard " + dealerScore;
                declareWinner();
            }
        } else {
            promptH2.innerHTML = "Dealer stands on " + dealerScore;
            declareWinner();
        }
    }, 2000)
}

function hitDealer() {
    setTimeout(() => {
        let card = shoe.pop();
        let pic = new Image();
        pic.src = `images/cards/${card.file}`
        dealerCardsDiv.appendChild(pic);
        dealerHand.push(card);
        
        if(card.kind == "Ace") {
            if(dealerAceScore == 11) {  // if dealer already has an Ace
                dealerAceScore = 12;
                card.valu = 1; // additional Ace counts as 1 = 12
            } else {
                dealerAceScore = 11; // ace counts 11
            }
            dealerScore += card.valu;
            promptH2.innerHTML = "Dealer Score:" + dealerScore;
            dealerScoreDiv.innerHTML = "Dealer Score:" + dealerScore;
            hitDealer();
        } else {
            dealerScore += card.valu;
            promptH2.innerHTML = "Dealer Score:" + dealerScore;
            dealerScoreDiv.innerHTML = "Dealer Score:" + dealerScore;
            if (dealerScore > 17) {
                stand();
            }
        }
        stand();
    }, 2000)
}

function declareWinner() {
    setTimeout(() => {
        if(dealerScore > 21) {
            promptH2.innerHTML = "You win! Congrats!"
        } else if(playerScore > dealerScore) {
            promptH2.innerHTML = "You win! Congrats!";
        } else if (playerScore < dealerScore) {
            promptH2.innerHTML = "Sorry! You lose!";
        } else {
            promptH2.innerHTML = "It's a Push!";
        }
    }, 1500)
}