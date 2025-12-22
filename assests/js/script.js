// Game State - MAIN GAME
const gameState = {
    currentHouse: 0,
    completedHouses: 0,
    totalHouses: 4,
    isPlaying: false,
    santaPosition: 0
};

// DOM Elements
let startBtn, endBtn, howToPlayBtn, elvesBtn, santa, housesContainer, houses;
let progressText, progressFill, completionMessage, snowContainer;
let mainGame, game1Container, game2Container, game3Container, game4Container;

// Initialize the game
function initGame() {
    // Get DOM elements
    startBtn = document.getElementById('startBtn');
    endBtn = document.getElementById('endBtn');
    howToPlayBtn = document.getElementById('howToPlayBtn');
    elvesBtn = document.getElementById('elvesBtn');
    santa = document.getElementById('santa');
    housesContainer = document.getElementById('houses-container');
    houses = document.querySelectorAll('.house');
    progressText = document.getElementById('progress-text');
    progressFill = document.getElementById('progress-fill');
    completionMessage = document.getElementById('completion-message');
    snowContainer = document.getElementById('snow');
    
    // Get screen elements
    mainGame = document.getElementById('mainGame');
    game1Container = document.getElementById('game1Container');
    game2Container = document.getElementById('game2Container');
    game3Container = document.getElementById('game3Container');
    game4Container = document.getElementById('game4Container');
    
    resetGame();
    createSnowflakes();
    setupEventListeners();
}

// Reset game to initial state
function resetGame() {
    gameState.currentHouse = 0;
    gameState.completedHouses = 0;
    gameState.isPlaying = false;
    gameState.santaPosition = 0;
    
    // Reset Santa position
    santa.style.left = '0px';
    
    // Reset all houses to locked state
    houses.forEach(house => {
        const status = house.querySelector('.house-status');
        status.textContent = '🔒';
        house.classList.remove('unlocked', 'completed');
        house.classList.add('locked');
    });
    
    // Reset progress
    updateProgress();
    
    // Hide completion message
    completionMessage.style.display = 'none';
    
    // Reset buttons
    startBtn.disabled = false;
    endBtn.disabled = true;
}

// Create snowflake animation
function createSnowflakes() {
    // Clear any existing snowflakes
    snowContainer.innerHTML = '';
    
    // Create 50 snowflakes
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄';
        
        // Random properties
        const size = Math.random() * 20 + 10;
        const startPosition = Math.random() * 100;
        const animationDuration = Math.random() * 5 + 5;
        const opacity = Math.random() * 0.7 + 0.3;
        const delay = Math.random() * 5;
        
        // Apply styles
        snowflake.style.left = `${startPosition}%`;
        snowflake.style.top = '-20px';
        snowflake.style.fontSize = `${size}px`;
        snowflake.style.opacity = opacity;
        
        // Animation
        snowflake.style.animation = `fall ${animationDuration}s linear ${delay}s infinite`;
        
        snowContainer.appendChild(snowflake);
    }
    
    // Add CSS for falling animation
    if (!document.querySelector('#snow-animation')) {
        const style = document.createElement('style');
        style.id = 'snow-animation';
        style.textContent = `
            @keyframes fall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Set up event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    endBtn.addEventListener('click', endGame);
    elvesBtn.addEventListener('click', showElvesInfo);
    howToPlayBtn.addEventListener('click', showHowToPlay);

    
    // Add click events to houses
    houses.forEach((house, index) => {
        house.addEventListener('click', () => {
            const houseNumber = parseInt(house.dataset.house);
            
            if (!gameState.isPlaying) {
                showSantaMessage("Click 'Start Game' first!");
                return;
            }
            
            if (houseNumber === gameState.currentHouse + 1 && 
                !house.classList.contains('completed')) {
                openMiniGame(houseNumber);
            } else if (houseNumber > gameState.currentHouse + 1) {
                showSantaMessage("Complete the previous game first!");
            }
        });
    });
}

// Start the game
function startGame() {
    if (gameState.isPlaying) return;
    
    gameState.isPlaying = true;
    startBtn.disabled = true;
    endBtn.disabled = false;
    
    // Move Santa to first house
    moveSantaToHouse(1);
    
    // Play start sound
    playSound('start');
}

// End the game
function endGame() {
    if (!gameState.isPlaying) return;
    
    gameState.isPlaying = false;
    startBtn.disabled = false;
    endBtn.disabled = true;
    
    // Show completion message if all houses are completed
    if (gameState.completedHouses === gameState.totalHouses) {
        completionMessage.style.display = 'block';
    }
}

// Move Santa to a specific house
function moveSantaToHouse(houseNumber) {
    if (houseNumber < 1 || houseNumber > gameState.totalHouses) return;
    
    const houseElements = document.querySelectorAll('.house');
    const targetHouse = houseElements[houseNumber - 1];
    const houseRect = targetHouse.getBoundingClientRect();
    const containerRect = housesContainer.getBoundingClientRect();
    
    const santaLeft = houseRect.left - containerRect.left + (houseRect.width / 2) - 50;
    
    gameState.currentHouse = houseNumber - 1;
    gameState.santaPosition = santaLeft;
    
    // Add walking animation
    santa.style.animation = 'santaWalk 0.5s infinite';
    santa.style.left = `${santaLeft}px`;
    
    setTimeout(() => {
        santa.style.animation = 'santaBounce 1s infinite alternate';
    }, 2000);
    
    // Unlock the current house
    unlockHouse(houseNumber - 1);
}

// Unlock a house
function unlockHouse(houseIndex) {
    if (houseIndex >= houses.length) return;
    
    const house = houses[houseIndex];
    const status = house.querySelector('.house-status');
    
    house.classList.remove('locked');
    house.classList.add('unlocked');
    status.textContent = '🎮';
}

// Complete the current house
function completeCurrentHouse() {
    if (!gameState.isPlaying) return;
    
    const currentHouseIndex = gameState.currentHouse;
    const house = houses[currentHouseIndex];
    const status = house.querySelector('.house-status');
    
    house.classList.remove('unlocked');
    house.classList.add('completed');
    status.textContent = '✅';
    
    gameState.completedHouses++;
    
    // Play Santa's "Ho Ho Ho" sound
    playSound('hohoho');
    
    // Update progress
    updateProgress();
    
    // Move to next house if available
    if (gameState.currentHouse < gameState.totalHouses - 1) {
        setTimeout(() => {
            moveSantaToHouse(gameState.currentHouse + 2);
        }, 1000);
    } else {
        // All houses completed
        setTimeout(() => {
            endGame();
        }, 1500);
    }
}

// Update progress display
function updateProgress() {
    const progressPercent = (gameState.completedHouses / gameState.totalHouses) * 100;
    progressFill.style.width = `${progressPercent}%`;
    progressText.textContent = `${gameState.completedHouses}/${gameState.totalHouses} Games Completed`;
}

// Play sounds
function playSound(type) {
    switch(type) {
        case 'start':
            showSantaMessage("Let's help Santa!");
            break;
        case 'hohoho':
            showSantaMessage("Ho Ho Ho!");
            break;
        case 'end':
            showSantaMessage("Thank you for helping Santa!");
            break;
    }
}

// Show Santa message
function showSantaMessage(message) {
    const existingMessage = santa.querySelector('.santa-message');
    if (existingMessage) existingMessage.remove();
    
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.classList.add('santa-message');
    messageEl.style.position = 'absolute';
    messageEl.style.top = '-50px';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translateX(-50%)';
    messageEl.style.background = 'rgba(255, 255, 255, 0.9)';
    messageEl.style.color = '#d32f2f';
    messageEl.style.padding = '8px 15px';
    messageEl.style.borderRadius = '20px';
    messageEl.style.fontWeight = 'bold';
    messageEl.style.fontSize = '1.2rem';
    messageEl.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    messageEl.style.zIndex = '100';
    messageEl.style.whiteSpace = 'nowrap';
    
    santa.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 2000);
}


// Show Elves information
function showElvesInfo() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('elvesModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'elvesModal';
        modal.classList.add('elves-modal');
        modal.innerHTML = `
            <div class="elves-modal-content">
                <button class="close-modal">&times;</button>
                <h2><i class="fas fa-hat-wizard"></i> The Code Elves</h2>
                <p>Meet the team of magical elves who help Santa with coding challenges!</p>
                <p>These skilled programmers work behind the scenes to make sure Santa's delivery system runs smoothly.</p>
                <div class="elves-list">
                    <div class="elf">
                        <i class="fas fa-code"></i>
                        <p>Algo Elf</p>
                    </div>
                    <div class="elf">
                        <i class="fas fa-paint-brush"></i>
                        <p>CSS Elf</p>
                    </div>
                    <div class="elf">
                        <i class="fas fa-cogs"></i>
                        <p>Logic Elf</p>
                    </div>
                    <div class="elf">
                        <i class="fas fa-bug"></i>
                        <p>Debug Elf</p>
                    </div>
                </div>
                <p>Together, they ensure that every line of code is festive and bug-free for Christmas delivery!</p>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listener to close button
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    modal.style.display = 'flex';
}


// Show How to Play instructions
function showHowToPlay() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('howToPlayModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'howToPlayModal';
        modal.classList.add('how-to-play-modal');
        modal.innerHTML = `
            <div class="how-to-play-modal-content">
                <button class="close-modal">&times;</button>
                <h2><i class="fas fa-question-circle"></i> How to Play</h2>
                <p>Help Santa deliver presents to all the houses by completing each coding challenge!</p>
                <ul>
                    <li>Click "Start Game" to begin the adventure</li>
                    <li>Santa will visit the first house and unlock the first game</li>
                    <li>Complete each game to unlock the next house</li>
                    <li>When you finish a game, Santa will say "Ho Ho Ho!" and move to the next house</li>
                    <li>Complete all four games to help Santa finish his deliveries</li>
                </ul>
                <p>Good luck, and thank you for helping Santa!</p>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listener to close button
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    modal.style.display = 'flex';
}

// Open mini-game based on house number
function openMiniGame(houseNumber) {
    // Hide main game
    mainGame.style.display = 'none';
    
    // Show the appropriate mini-game
    switch(houseNumber) {
        case 1:
            initGrinchHuntGame();
            game1Container.style.display = 'flex';
            break;
        case 2:
            initMemoryMatchGame();
            game2Container.style.display = 'flex';
            break;
        case 3:
            initCodePuzzleGame();
            game3Container.style.display = 'flex';
            break;
        case 4:
            initPresentStackGame();
            game4Container.style.display = 'flex';
            break;
    }
}

// Return to main game from any mini-game
function returnToMainGame(gameWon = false) {
    // Hide all game containers
    game1Container.style.display = 'none';
    game2Container.style.display = 'none';
    game3Container.style.display = 'none';
    game4Container.style.display = 'none';
    
    // Show main game
    mainGame.style.display = 'block';
    
    // If game was won, complete the current house
    if (gameWon) {
        completeCurrentHouse();
    }
}

// Close a mini-game without winning
function closeMiniGame() {
    returnToMainGame(false);
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);