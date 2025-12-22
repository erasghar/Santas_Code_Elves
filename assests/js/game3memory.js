function initMemoryGame() {
    game3Container.innerHTML = `
        <div class="game-content memory-game">

            <button class="close-game-btn" id="closeMemoryGame">&times;</button>

            <h1>Memory Game</h1>
            <div id="timer">10</div>

            <div id="hud">
                <div id="lives">❤️❤️❤️</div>
            </div>

            <div class="MemoryGame">
                <div class="memory-card" data-card="🎄"></div>
                <div class="memory-card" data-card="🎄"></div>

                <div class="memory-card" data-card="🎅"></div>
                <div class="memory-card" data-card="🎅"></div>

                <div class="memory-card" data-card="🎁"></div>
                <div class="memory-card" data-card="🎁"></div>

                <div class="memory-card" data-card="⛄"></div>
                <div class="memory-card" data-card="⛄"></div>

                <div class="memory-card" data-card="🦌"></div>
                <div class="memory-card" data-card="🦌"></div>

                <div class="memory-card" data-card="⭐"></div>
                <div class="memory-card" data-card="⭐"></div>
            </div>

            <button id="restart">Restart</button>
        </div>
    `;

    setupMemoryGame();
}

function setupMemoryGame() {

    const cards = document.querySelectorAll(".memory-card");
    const restartBtn = document.getElementById("restart");
    const timerDisplay = document.getElementById("timer");
    const livesDisplay = document.getElementById("lives");

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let lives = 3;
    let idleTimer = null;
    let matchTimer = null;
    let gameOver = false;
    let previewTimer = null;

    function updateLives() {
        livesDisplay.textContent = "❤️".repeat(lives);
    }

    function shuffleCards() {
        cards.forEach(card => {
            card.style.order = Math.floor(Math.random() * cards.length);
        });
    }

    function previewCards() {
        lockBoard = true;
        timerDisplay.textContent = "Memorise the cards...";

        cards.forEach(card => {
            card.classList.add("flipped");
            card.textContent = card.dataset.card;
        });

        previewTimer = setTimeout(() => {
            cards.forEach(card => {
                card.classList.remove("flipped");
                card.textContent = "";
            });

            lockBoard = false;
            startIdleTimer();
        }, 8000);
    }

    function startIdleTimer() {
        let timeLeft = 10;
        timerDisplay.textContent = timeLeft;

        idleTimer = setInterval(() => {
            if (lockBoard) return;

            timeLeft--;
            timerDisplay.textContent = timeLeft;

            if (timeLeft === 0) {
                clearInterval(idleTimer);
                lives--;
                updateLives();

                if (lives <= 0) {
                    endGame("You Lose");
                } else {
                    startIdleTimer();
                }
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
        if (lockBoard || gameOver) return;
        if (this === firstCard || this.classList.contains("matched")) return;

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
        firstCard.dataset.card === secondCard.dataset.card
            ? disableCards()
            : unflipCards();
    }

    function disableCards() {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");
        resetBoard();
        checkWin();
        startIdleTimer();
    }

    function unflipCards() {
        lockBoard = true;

        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            firstCard.textContent = "";
            secondCard.textContent = "";

            lives--;
            updateLives();

            if (lives <= 0) {
                endGame("You Lose");
                return;
            }

            resetBoard();
            startIdleTimer();
        }, 1000);
    }

    function checkWin() {
        if (document.querySelectorAll(".memory-card.matched").length === cards.length) {
            endGame("🎉 You Win!");
        }
    }

    function endGame(message) {
        clearInterval(idleTimer);
        clearInterval(matchTimer);
        lockBoard = true;
        gameOver = true;
        timerDisplay.textContent = message;
    }

    function resetBoard() {
        [firstCard, secondCard] = [null, null];
        lockBoard = !gameOver;
        clearInterval(idleTimer);
        clearInterval(matchTimer);
    }

    cards.forEach(card => card.addEventListener("click", flipCard));
    restartBtn.addEventListener("click", initMemoryGame);

    shuffleCards();
    previewCards();
    updateLives();
}