const cards = document.querySelectorAll(".memory-card");
const restartBtn = document.getElementById("restart");

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let lives = 3;

function shuffle() {
    cards.forEach(card => {
        const randomPos = Math.floor(Math.random() * cards.length);
        card.style.order = randomPos;
    });
}

function previewCards() {
    lockBoard = true;
    timerDisplay.textContent = "Memorise the cards...";

    cards.forEach(card => {
        card.classList.add("flipped");
        card.textContent = card.dataset.card;
    });
    setTimeout(() => {
        cards.forEach(card => {
            card.classList.remove("flipped");
            card.textContent = "";
        });
        lockBoard = false;
        timerDisplay.textContent = "Select a card";
    }, 8000);
}

function restartGame() {
    lives = 3;
    timerDisplay.textContent = `Lives: ${lives}`;

    cards.forEach(card => {
        card.classList.remove("flipped", "matched");
        card.textContent = "";
    });

    resetBoard();
    shuffleCards();
    previewCards();
}

function startIdleTimer() {
    clearInterval(idleTimer);

    let timeLeft = 10;
    timerDisplay.textContent = timeLeft;

    idleTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft === 0) {
            clearInterval(idleTimer);
            startIdleTimer();
        }
    }, 1000);
}

function startMatchTimer() {
    clearInterval(matchTimer);

    let timeLeft = 5;
    timerDisplay.textContent = timeLeft;

    matchTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft === 0) {
            clearInterval(matchTimer);
            firstCard.classList.remove("flipped");
            firstCard.textContent = "";
            firstCard = null;
            startIdleTimer();
        }
    }, 1000);
}
