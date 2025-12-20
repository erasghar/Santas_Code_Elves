const cards = document.querySelectorAll(".memory-card");
const restartBtn = document.getElementById("restart");
const timerDisplay = document.getElementById("timer");

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let lives = 3;
let idleTimer = null;
let matchTimer = null;

function shuffleCards() {
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
        startIdleTimer();
    }, 8000);
}

function restartGame() {
    lives = 3;
    console.log("Lives:", lives);

    cards.forEach(card => {
        card.classList.remove("flipped", "matched");
        card.textContent = "";
    });

    resetBoard();
    shuffleCards();
    previewCards();
}

function startIdleTimer() {
    if (lockBoard) return;

    clearInterval(idleTimer);

    let timeLeft = 10;
    timerDisplay.textContent = timeLeft;

    idleTimer = setInterval(() => {
        if (lockBoard) {
            clearInterval(idleTimer);
            return;
        }

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

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    if (this.classList.contains("matched")) return;

    this.classList.add("flipped");
    this.textContent = this.dataset.card;
    if (!firstCard) {
        clearInterval(idleTimer);
        firstCard = this;
        startMatchTimer();
        return;
    }
    secondCard = this;
    clearInterval(matchTimer);
    checkMatch();
}

function checkMatch() {
    const isMatch = firstCard.dataset.card === secondCard.dataset.card;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    resetBoard();
}

function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        firstCard.textContent = "";
        secondCard.textContent = "";

        lives--;
        timerDisplay.textContent = lives === 0
            ? "Out of lives!"
            : `Lives: ${lives}`;

        if (lives === 0) {
            restartGame();
            return;
        }

        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
    clearInterval(idleTimer);
    clearInterval(matchTimer);
}
cards.forEach(card => card.addEventListener("click", flipCard));
restartBtn.addEventListener("click", restartGame);

shuffleCards();
previewCards();