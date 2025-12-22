// Game 1: Grinch Hunt
let grinchGameActive = false;
let grinchScore = 0;
let grinchHits = 0;
let grinchTime = 15;
let grinchTimer;
let grinchInterval;

function initGrinchHuntGame() {
    console.log('initGrinchHuntGame called. game1Container:', typeof game1Container !== 'undefined' ? game1Container : 'undefined');
    // Ensure container exists
    if (typeof game1Container === 'undefined' || !game1Container) {
        console.error('game1Container is not defined or not found in DOM. Aborting Grinch initialization.');
        return;
    }
    // Setup game HTML
    game1Container.innerHTML = `
        <div class="game-content"  style="background: linear-gradient(to bottom, #1a5f23, #0d3b13); padding: 30px; border-radius: 20px; width: 100%; max-height: 100vh; overflow-y: auto; border: 5px solid #ffcc00; position: relative;">
            <button class="close-game-btn" id="closeGrinchGame" style="position: absolute; top: 15px; right: 15px; background: #ff4d4d; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.5rem; cursor: pointer;">&times;</button>
            
            <div class="game-header">
                <h2 style="color: #ffcc00; font-size: 2.5rem; text-align: center; margin-bottom: 20px;">🎯 Grinch Hunt Game</h2>
                <div style="background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 15px; margin-bottom: 20px; text-align: left;">
                <h3 style="color: #4CAF50; margin-bottom: 10px;">How to Play:</h3>
                <p style="margin-bottom: 10px;">The Grinch is trying to steal Christmas! Hit him with snowballs 5 times before time runs out.</p>
                <ul style="padding-left: 20px; margin-bottom: 15px;">
                    <li>Click on the Grinch when he appears</li>
                    <li>You have 15 seconds to hit him 5 times</li>
                    <li>Each hit scores 10 points</li>
                    <li>Win the game to unlock the next house!</li>
                </ul>
            </div>
            </div>
            
            <div class="game-stats">
                <div class="stat-box">
                    <h3>Score: <span id="grinchScore">0</span></h3>
                    <p>Target: 50 points (5 hits)</p>
                </div>
                <div class="stat-box">
                    <h3>Time: <span id="grinchTimer">15</span>s</h3>
                    <p>Hits: <span id="grinchHits">0</span>/5</p>
                </div>
                <button id="startGrinchGame" class="btn btn-start">
                    <i class="fas fa-play"></i> Start Hunt
                </button>
            </div>
            
            <div class="game-area" id="grinchGameArea" style="position: relative; width: 100%; height: 400px; background: linear-gradient(to bottom, #0c1643, #1a237e); border-radius: 15px; overflow: hidden; border: 3px solid #ffcc00;">
                <div id="grinchCharacter" style="display: none; position: absolute; width: 80px; height: 80px; background: #00b894; border-radius: 50%; cursor: pointer; transition: all 0.3s; border: 3px solid #ff4d4d;"></div>
                <div id="grinchSnowball" style="display: none; position: absolute; width: 20px; height: 20px; background: white; border-radius: 50%; pointer-events: none;"></div>
                <div id="grinchMessage" class="game-message" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 2rem; font-weight: bold; text-align: center; display: none;"></div>
            </div>
            
            <div class="game-controls" style="margin-top: 20px; text-align: center;">
                <button id="backFromGrinch" class="back-home-btn" style="background: linear-gradient(to right, #2196F3, #0d47a1); color: white; border: none; padding: 15px 30px; border-radius: 25px; font-size: 1.3rem; font-weight: bold; cursor: pointer; display: none;">
                    <i class="fas fa-home"></i> Back to Village
                </button>
            </div>
        </div>
    `;
    
    // Add game-specific styles
    const style = document.createElement('style');
    style.id = 'grinch-styles';
    style.textContent = `
        #grinchCharacter {
            position: absolute;
            width: 80px;
            height: 80px;
            background: linear-gradient(to bottom, #00b894, #008b74);
            border-radius: 50%;
            cursor: pointer;
            border: 3px solid #ff4d4d;
            display: none;
            box-shadow: 0 0 10px rgba(0, 184, 148, 0.5);
            transition: transform 0.1s;
        }
        
        #grinchCharacter:hover {
            transform: scale(1.1);
        }
        
        #grinchSnowball {
            position: absolute;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            pointer-events: none;
            display: none;
            box-shadow: 0 0 10px white;
            z-index: 5;
        }
        
        .grinch-hit {
            animation: hitEffect 0.3s;
        }
        
        @keyframes hitEffect {
            0% { transform: scale(1); }
            50% { transform: scale(1.5); background: #ff0000; }
            100% { transform: scale(1); }
        }
        
        .snowball-explode {
            animation: explode 0.3s;
        }
        
        @keyframes explode {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
        }
    `;
    
    // Remove existing styles if any
    const existingStyles = document.getElementById('grinch-styles');
    if (existingStyles) existingStyles.remove();
    
    document.head.appendChild(style);
    
    // Setup event listeners
    setupGrinchEventListeners();
    
    // Reset game state
    grinchScore = 0;
    grinchHits = 0;
    grinchTime = 15;
    grinchGameActive = false;
    
    updateGrinchDisplay();
}

function setupGrinchEventListeners() {
    // Close button
    document.getElementById('closeGrinchGame').addEventListener('click', () => {
        stopGrinchGame();
        closeMiniGame();
    });
    
    // Start game button
    document.getElementById('startGrinchGame').addEventListener('click', startGrinchGame);
    
    // Back to village button (appears when player wins)
    document.getElementById('backFromGrinch').addEventListener('click', () => {
        stopGrinchGame();
        returnToMainGame(true);
    });
    
    // Grinch click event (delegated since grinchCharacter might not exist yet)
    document.getElementById('grinchGameArea').addEventListener('click', (e) => {
        if (e.target.id === 'grinchCharacter' && grinchGameActive) {
            hitGrinch();
        }
    });
}

function startGrinchGame() {
    if (grinchGameActive) return;
    
    grinchGameActive = true;
    grinchScore = 0;
    grinchHits = 0;
    grinchTime = 15;
    
    // Hide start button and message
    document.getElementById('startGrinchGame').style.display = 'none';
    document.getElementById('grinchMessage').style.display = 'none';
    document.getElementById('backFromGrinch').style.display = 'none';
    
    updateGrinchDisplay();
    
    // Start timer
    grinchTimer = setInterval(() => {
        grinchTime--;
        document.getElementById('grinchTimer').textContent = grinchTime;
        
        if (grinchTime <= 0) {
            endGrinchGame(false);
        }
    }, 1000);
    
    // Start Grinch appearing
    grinchInterval = setInterval(makeGrinchAppear, 1400);
    
    // Make first Grinch appear immediately
    setTimeout(makeGrinchAppear, 300);
}

function makeGrinchAppear() {
    if (!grinchGameActive) return;
    
    const gameArea = document.getElementById('grinchGameArea');
    const grinch = document.getElementById('grinchCharacter');
    
    // Random position
    const maxX = gameArea.clientWidth - 80;
    const maxY = gameArea.clientHeight - 80;
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);
    
    grinch.style.left = `${x}px`;
    grinch.style.top = `${y}px`;
    grinch.style.display = 'block';
    
    // Make Grinch disappear after 700ms
    setTimeout(() => {
        if (grinch.style.display === 'block' && grinchGameActive) {
            grinch.style.display = 'none';
        }
    }, 1100);
}

function hitGrinch() {
    if (!grinchGameActive) return;
    
    const grinch = document.getElementById('grinchCharacter');
    const snowball = document.getElementById('grinchSnowball');
    const gameArea = document.getElementById('grinchGameArea');
    
    // Hide Grinch immediately
    grinch.style.display = 'none';
    
    // Add hit effect
    grinch.classList.add('grinch-hit');
    setTimeout(() => {
        grinch.classList.remove('grinch-hit');
    }, 300);
    
    // Snowball animation
    const grinchRect = grinch.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();
    
    snowball.style.left = `${grinchRect.left - gameAreaRect.left + 40}px`;
    snowball.style.top = `${grinchRect.top - gameAreaRect.top + 40}px`;
    snowball.style.display = 'block';
    
    // Add explode animation
    snowball.classList.add('snowball-explode');
    
    setTimeout(() => {
        snowball.style.display = 'none';
        snowball.classList.remove('snowball-explode');
    }, 300);
    
    // Update score
    grinchScore += 10;
    grinchHits++;
    updateGrinchDisplay();
    
    // Play hit sound
    playHitSound();
    
    // Check win condition
    if (grinchHits >= 5) {
        endGrinchGame(true);
    }
}

function updateGrinchDisplay() {
    document.getElementById('grinchScore').textContent = grinchScore;
    document.getElementById('grinchTimer').textContent = grinchTime;
    document.getElementById('grinchHits').textContent = grinchHits;
}

function playHitSound() {
    try {
        // Simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Audio not supported, that's ok
    }
}

function endGrinchGame(won) {
    grinchGameActive = false;
    
    // Clear intervals
    clearInterval(grinchTimer);
    clearInterval(grinchInterval);
    
    // Hide Grinch
    document.getElementById('grinchCharacter').style.display = 'none';
    
    // Show message
    const messageEl = document.getElementById('grinchMessage');
    messageEl.style.display = 'block';
    
    if (won) {
        messageEl.textContent = "🎉 You Win! Grinch Defeated!";
        messageEl.style.color = "#4CAF50";
        document.getElementById('backFromGrinch').style.display = 'inline-block';
    } else {
        messageEl.textContent = "😞 Time's Up! Try Again!";
        messageEl.style.color = "#ff4d4d";
        document.getElementById('startGrinchGame').style.display = 'inline-block';
    }
}

function stopGrinchGame() {
    grinchGameActive = false;
    clearInterval(grinchTimer);
    clearInterval(grinchInterval);
}