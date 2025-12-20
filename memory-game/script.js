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