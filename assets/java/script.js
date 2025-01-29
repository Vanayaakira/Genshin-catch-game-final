const target = document.getElementById('target');
const container = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const highscoreElement = document.getElementById('highscore');
const gameOverScreen = document.getElementById('game-over');
const tutorialScreen = document.getElementById('tutorial');
const difficultyPopup = document.getElementById('difficulty-popup');
const timerPopup = document.getElementById('timer-popup');
const finalScoreElement = document.getElementById('final-score');
const finalHighscoreElement = document.getElementById('final-highscore');
const finalDifficultyElement = document.getElementById('final-difficulty');
const timerElement = document.getElementById('timer');
const difficultyLabel = document.getElementById('difficulty-label');

let score = 0;
let highscores = {
    easy: 0,
    medium: 0,
    sigma: 0
};
let currentDifficulty = '';
let gameStarted = false;
let gameInterval;
let timerInterval;
let timeLeft = 0;

const difficultySettings = {
    easy: { interval: 4000, label: 'Mudah' },
    medium: { interval: 2000, label: 'Medium' },
    sigma: { interval: 1000, label: 'Sigma' }
};

window.onload = function() {
    tutorialScreen.style.display = 'block';
    // Load highscores from localStorage if available
    const savedHighscores = localStorage.getItem('genshinCatchHighscores');
    if (savedHighscores) {
        highscores = JSON.parse(savedHighscores);
    }
};

function showDifficultySelection() {
    tutorialScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    difficultyPopup.style.display = 'block';
}

function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;
    difficultyLabel.textContent = `Mode: ${difficultySettings[difficulty].label}`;
    
    // Atur jumlah obstacle berdasarkan kesulitan
    const obstacles = document.querySelectorAll('.obstacle');
    
    // Hapus semua obstacle yang ada
    obstacles.forEach(obs => obs.remove());
    
    // Tambahkan obstacle sesuai kesulitan
    if (difficulty === 'sigma') {
        // Tambah 3 obstacle untuk mode sigma
        for (let i = 0; i < 3; i++) {
            const newObstacle = document.createElement('div');
            newObstacle.className = 'obstacle';
            newObstacle.innerHTML = `
                <img src="assets/img/★.jpg" alt="Raiden Ei">
                <div class="character-name">Raiden Ei</div>
            `;
            container.appendChild(newObstacle);
            
            // Tambahkan event listener untuk obstacle baru
            newObstacle.addEventListener('click', (e) => {
                if (!gameStarted) return;
                e.stopPropagation();
                createParticles(e.clientX, e.clientY);
                gameOver();
            });
        }
    } else {
        // Tambah 1 obstacle untuk mode mudah dan medium
        const newObstacle = document.createElement('div');
        newObstacle.className = 'obstacle';
        newObstacle.innerHTML = `
            <img src="assets/img/★.jpg" alt="Raiden Ei">
            <div class="character-name">Raiden Ei</div>
        `;
        container.appendChild(newObstacle);
        
        // Tambahkan event listener untuk obstacle
        newObstacle.addEventListener('click', (e) => {
            if (!gameStarted) return;
            e.stopPropagation();
            createParticles(e.clientX, e.clientY);
            gameOver();
        });
    }

    difficultyPopup.style.display = 'none';
    timerPopup.style.display = 'block';
    highscoreElement.textContent = highscores[difficulty];
}

function startGameWithTimer(seconds) {
    timerPopup.style.display = 'none';
    timeLeft = seconds;
    updateTimerDisplay();
    startGame();

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            gameOver();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function startGame() {
    score = 0;
    scoreElement.textContent = score;
    gameStarted = true;
    moveElement(target);
    const obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach(obstacle => moveElement(obstacle));

    if (gameInterval) {
        clearInterval(gameInterval);
    }

    gameInterval = setInterval(() => {
        if (gameStarted && gameOverScreen.style.display !== 'block') {
            moveElement(target);
            const currentObstacles = document.querySelectorAll('.obstacle');
            currentObstacles.forEach(obstacle => moveElement(obstacle));
        }
    }, difficultySettings[currentDifficulty].interval);
}

function moveElement(element) {
    const maxX = container.clientWidth - element.clientWidth;
    const maxY = container.clientHeight - element.clientHeight;
    
    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;
    
    element.style.left = newX + 'px';
    element.style.top = newY + 'px';
}

function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = Math.random() * 10 + 5 + 'px';
        particle.style.height = particle.style.width;
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        particle.style.transform = `translate(${vx}px, ${vy}px)`;
        
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 500);
    }
}

function gameOver() {
    gameStarted = false;
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    gameOverScreen.style.display = 'block';
    finalScoreElement.textContent = score;
    finalDifficultyElement.textContent = difficultySettings[currentDifficulty].label;
    
    if (score > highscores[currentDifficulty]) {
        highscores[currentDifficulty] = score;
        localStorage.setItem('genshinCatchHighscores', JSON.stringify(highscores));
    }
    
    finalHighscoreElement.textContent = highscores[currentDifficulty];
    highscoreElement.textContent = highscores[currentDifficulty];
}

target.addEventListener('click', (e) => {
    if (!gameStarted) return;
    e.stopPropagation();
    score++;
    scoreElement.textContent = score;
    createParticles(e.clientX, e.clientY);
    moveElement(target);
    const obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach(obstacle => moveElement(obstacle));
    
    target.style.transform = 'scale(0.8)';
    setTimeout(() => target.style.transform = 'scale(1)', 100);
});

// Prevent clicking on container from affecting game
container.addEventListener('click', (e) => {
    if (!gameStarted) return;
    e.stopPropagation();
});

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    // Position elements initially off-screen
    target.style.left = '-100px';
    const initialObstacle = document.querySelector('.obstacle');
    if (initialObstacle) {
        initialObstacle.style.left = '-100px';
    }
});