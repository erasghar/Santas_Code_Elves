let memory2Interval = null;
let memory2RevealTimeout = null;

function initMemoryGame() {
    cleanupMemoryGame2();
    game2Container.innerHTML = `
    <div class="memory2-wrapper">
      <button class="memory2-close" aria-label="Close">&times;</button>

      <div class="memory2-title">
        <span class="memory2-title-icon">🧠</span>
        <h2>Memory Match Game</h2>
      </div>

      <div class="memory2-howto">
        <h3>How to Play:</h3>
        <p>All cards will be revealed for <strong>10 seconds</strong>. Memorise them, then match all pairs!</p>
        <ul>
          <li>Click two cards to flip them</li>
          <li>If they match, they stay revealed</li>
          <li><strong>Only 1 life</strong> — one wrong pair and you lose</li>
          <li>Match all pairs to unlock the next house!</li>
        </ul>
      </div>

      <div class="memory2-statsbar">
        <div class="memory2-stat">
          <div class="memory2-stat-label">Matches:</div>
          <div class="memory2-stat-value"><span id="memory2Matches">0</span>/<span id="memory2Total">6</span></div>
        </div>

        <div class="memory2-stat center">
          <div class="memory2-stat-label">Time:</div>
          <div class="memory2-stat-value"><span id="memory2Time">10</span>s</div>
        </div>

        <div class="memory2-stat">
          <div class="memory2-stat-label">Lives:</div>
          <div class="memory2-stat-value" id="memory2Lives">❤️</div>
        </div>

        <button class="memory2-startbtn" id="memory2StartBtn">
          <span class="play-icon">▶</span> Start Match
        </button>
      </div>

      <div class="memory2-playarea">
        <div class="memory2-grid" id="memory2Grid"></div>

        <div class="memory2-overlay" id="memory2Overlay" style="display:none;">
          <div class="memory2-overlay-inner">
            <div class="memory2-overlay-title" id="memory2OverlayTitle"></div>
            <div class="memory2-overlay-sub" id="memory2OverlaySub"></div>

            <div class="memory2-overlay-actions">
              <button class="memory2-btn memory2-btn-retry" id="memory2RetryBtn" style="display:none;">
                🔄 Start Again
              </button>

              <button class="memory2-btn memory2-btn-village" id="memory2VillageBtn" style="display:none;">
                🏠 Back to Village
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
    const closeBtn = game2Container.querySelector(".memory2-close");
    closeBtn.addEventListener("click", () => {
        cleanupMemoryGame2()
        returnToMainGame(false);
    });

    // Start button
    const startBtn = document.getElementById("memory2StartBtn");
    startBtn.addEventListener("click", startMemoryGame2);
    buildMemoryBoard2();
    setBoardEnabled2(false);
}

function cleanupMemoryGame2() {
    if (memory2Interval) clearInterval(memory2Interval);
    if (memory2RevealTimeout) clearTimeout(memory2RevealTimeout);
    memory2Interval = null;
    memory2RevealTimeout = null;
}

function buildMemoryBoard2() {
    const grid = document.getElementById("memory2Grid");
    if (!grid) return;

    grid.innerHTML = "";

    // 12 cards = 6 pairs (nice size like Grinch play area)
    const symbols = ["🎄", "🎅", "🎁", "⛄", "⭐", "🦌"];
    const deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5);

    deck.forEach((sym) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "memory2-card";
        card.dataset.symbol = sym;
        card.dataset.state = "down"; // down | up | matched
        card.innerHTML = `<span class="memory2-card-inner">?</span>`;
        grid.appendChild(card);
    });
}

function startMemoryGame2() {
    cleanupMemoryGame2();

    // Reset UI stats
    document.getElementById("memory2Matches").textContent = "0";
    document.getElementById("memory2Lives").textContent = "❤️";
    document.getElementById("memory2Total").textContent = "6";

    // Reset play area text if previously lost
    const playArea = document.querySelector(".memory2-playarea");
    playArea.innerHTML = `<div class="memory2-grid" id="memory2Grid"></div>`;

    // Disable Start button while running
    const startBtn = document.getElementById("memory2StartBtn");
    startBtn.disabled = true;
    startBtn.classList.add("disabled");

    // Rebuild a fresh shuffled board every start
    buildMemoryBoard2();

    let matches = 0;
    let firstCard = null;
    let secondCard = null;
    let lock = true;

    // ---- TIMER SETUP ----
    let reviewTime = 10;   // 10s memorise
    let playTime = 20;     // 20s play
    let phase = "review";  // review | play

    document.getElementById("memory2Time").textContent = reviewTime;

    // Reveal all cards during review
    revealAllCards2(true);
    setBoardEnabled2(false);

    memory2Interval = setInterval(() => {
        if (phase === "review") {
            reviewTime--;
            document.getElementById("memory2Time").textContent = reviewTime;

            if (reviewTime <= 0) {
                phase = "play";
                revealAllCards2(false);
                setBoardEnabled2(true);
                lock = false;
                document.getElementById("memory2Time").textContent = playTime;
            }
        } else {
            playTime--;
            document.getElementById("memory2Time").textContent = playTime;

            if (playTime <= 0) {
                clearInterval(memory2Interval);
                memory2Interval = null;
                setBoardEnabled2(false);
                loseMemoryGame2("😞 Time's Up! Try Again!");
            }
        }
    }, 1000);

    // ---- CLICK LOGIC ----
    const grid = document.getElementById("memory2Grid");
    grid.onclick = (e) => {
        const card = e.target.closest(".memory2-card");
        if (!card) return;

        if (lock) return;
        if (card.dataset.state === "matched") return;
        if (card === firstCard) return;

        flipCardUp2(card);

        if (!firstCard) {
            firstCard = card;
            return;
        }

        secondCard = card;
        lock = true;

        if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
            firstCard.dataset.state = "matched";
            secondCard.dataset.state = "matched";
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");

            matches++;
            document.getElementById("memory2Matches").textContent = matches;

            firstCard = null;
            secondCard = null;
            lock = false;

            if (matches === 6) {
                clearInterval(memory2Interval);
                memory2Interval = null;
                winMemoryGame2();
            }
        } else {
            // ONE LIFE ONLY → instant lose
            setTimeout(() => {
                clearInterval(memory2Interval);
                memory2Interval = null;
                setBoardEnabled2(false);
                loseMemoryGame2("😞 Time's Up! Try Again!");
            }, 600);
        }
    };
}


function setBoardEnabled2(enabled) {
    const cards = document.querySelectorAll(".memory2-card");
    cards.forEach((c) => (c.disabled = !enabled));
}

function revealAllCards2(show) {
    const cards = document.querySelectorAll(".memory2-card");
    cards.forEach((card) => {
        if (card.dataset.state === "matched") return;

        if (show) {
            card.dataset.state = "up";
            card.classList.add("flipped");
            card.querySelector(".memory2-card-inner").textContent = card.dataset.symbol;
        } else {
            card.dataset.state = "down";
            card.classList.remove("flipped");
            card.querySelector(".memory2-card-inner").textContent = "?";
        }
    });
}

function flipCardUp2(card) {
    if (card.dataset.state === "matched") return;
    card.dataset.state = "up";
    card.classList.add("flipped");
    card.querySelector(".memory2-card-inner").textContent = card.dataset.symbol;
}

function showOverlay2(title, sub) {
    const overlay = document.getElementById("memory2Overlay");
    const t = document.getElementById("memory2OverlayTitle");
    const s = document.getElementById("memory2OverlaySub");
    overlay.style.display = "flex";
    t.textContent = title;
    s.textContent = sub || "";
}

function hideOverlay2() {
    const overlay = document.getElementById("memory2Overlay");
    const retry = document.getElementById("memory2RetryBtn");
    const village = document.getElementById("memory2VillageBtn");
    if (overlay) overlay.style.display = "none";
    if (retry) retry.style.display = "none";
    if (village) village.style.display = "none";
}

function loseMemoryGame2() {
    cleanupMemoryGame2();
    setBoardEnabled2(false);

    const playArea = document.querySelector(".memory2-playarea");
    playArea.innerHTML = `
        <div class="memory2-lose-message">
            😞 Time's Up! Try Again!
        </div>
    `;

    // Re-enable Start Match button
    const startBtn = document.getElementById("memory2StartBtn");
    startBtn.disabled = false;
    startBtn.classList.remove("disabled");
}

function winMemoryGame2() {
    cleanupMemoryGame2();
    setBoardEnabled2(false);

    const playArea = document.querySelector(".memory2-playarea");
    if (!playArea) {
        console.error("memory2-playarea not found");
        return;
    }
    playArea.innerHTML = `
        <div class="memory2-win-message">
            🎉 You Win! Memory Master!
        </div>
    `;
    document.querySelector(".memory2-back-btn")?.remove();
    const backBtn = document.createElement("button");
    backBtn.className = "memory2-back-btn";
    backBtn.innerHTML = "🏠 Back to Village";

    backBtn.onclick = () => {
        returnToMainGame(true);
    };
    playArea.parentNode.appendChild(backBtn);
}
