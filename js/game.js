const gameContainer = document.getElementById('game-container');
const startMenu = document.getElementById('start-menu');
const pauseMenu = document.getElementById('pause-menu');
const startGameButton = document.getElementById('start-game');
const exitGameButton = document.getElementById('exit-game');
const resumeGameButton = document.getElementById('resume-game');
const restartGameButton = document.getElementById('restart-game');
const exitGamePauseButton = document.getElementById('exit-game-pause');
const menu = document.getElementById('menu');
const continueButton = document.getElementById('continue');
const restartButton = document.getElementById('restart');
const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const fpsDisplay = document.getElementById('fps');

// Create player element
const player = document.createElement('div');
player.id = 'player';
gameContainer.appendChild(player);

let lastTime = 0;
let elapsedTime = 0;
let score = 0;
let lives = 3;
let isGameRunning = false;
let isGamePaused = false;
let playerX = 100;
let playerY = 100;
const playerSpeed = 400; // pixels per second

const enemies = [];
const bullets = [];
const bulletSpeed = 300; // pixels per second
const enemySpeed = 50; // pixels per second
const enemySpawnInterval = 3000; // milliseconds
let enemySpawnTimer = 0;

const fps = 60;
const frameDuration = 1000 / fps;
let frameCount = 0;
let fpsStartTime = performance.now();

function gameLoop(timestamp) {
    if (!isGameRunning || isGamePaused) return;

    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    elapsedTime += deltaTime;
    timeDisplay.textContent = elapsedTime.toFixed(2);

    // Update player position
    updatePlayerPosition(deltaTime);

    // Spawn enemies
    enemySpawnTimer += deltaTime * 1000;
    if (enemySpawnTimer > enemySpawnInterval) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }

    // Update enemies position
    updateEnemiesPosition(deltaTime);

    // Update bullets position
    updateBulletsPosition(deltaTime);

    // Check for collisions
    checkCollisions();

    // Update scoreboard
    updateScoreboard();

    // Calculate and update FPS
    frameCount++;
    const fpsCurrentTime = performance.now();
    if (fpsCurrentTime - fpsStartTime >= 1000) {
        fpsDisplay.textContent = frameCount;
        frameCount = 0;
        fpsStartTime = fpsCurrentTime;
    }

    if (!isGamePaused) {
        requestAnimationFrame(gameLoop);
    }
}

function updatePlayerPosition(deltaTime) {
    if (keys.ArrowUp) playerY -= playerSpeed * deltaTime;
    if (keys.ArrowDown) playerY += playerSpeed * deltaTime;
    if (keys.ArrowLeft) playerX -= playerSpeed * deltaTime;
    if (keys.ArrowRight) playerX += playerSpeed * deltaTime;

    // Ensure player stays within the game container bounds
    const minX = 0;
    const maxX = gameContainer.clientWidth - player.offsetWidth;
    const minY = 0;
    const maxY = gameContainer.clientHeight - player.offsetHeight;

    playerX = Math.max(minX, Math.min(maxX, playerX));
    playerY = Math.max(minY, Math.min(maxY, playerY));

    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
}

function spawnEnemy() {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    const enemyX = Math.random() * (gameContainer.clientWidth - 40); // Ensure enemy spawns within the bounds
    enemy.style.left = `${enemyX}px`;
    enemy.style.top = `${-40}px`;
    gameContainer.appendChild(enemy);
    enemies.push(enemy);
}

function updateEnemiesPosition(deltaTime) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const enemyY = parseFloat(enemy.style.top);
        enemy.style.top = `${enemyY + enemySpeed * deltaTime}px`;

        // Remove enemy if it goes out of bounds
        if (enemyY > gameContainer.clientHeight) {
            gameContainer.removeChild(enemy);
            enemies.splice(i, 1);
            // Deduct a life for missed enemy
            lives--;
            if (lives <= 0) {
                endGame();
            }
        }
    }
}

function shootBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = `${playerX + player.offsetWidth / 2 - 2.5}px`;
    bullet.style.top = `${playerY}px`;
    gameContainer.appendChild(bullet);
    bullets.push(bullet);
}

function updateBulletsPosition(deltaTime) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        const bulletY = parseFloat(bullet.style.top);
        bullet.style.top = `${bulletY - bulletSpeed * deltaTime}px`;

        // Remove bullet if it goes out of bounds
        if (bulletY < 0) {
            gameContainer.removeChild(bullet);
            bullets.splice(i, 1);
        }
    }
}

function checkCollisions() {
    for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
        const bullet = bullets[bulletIndex];
        const bulletRect = bullet.getBoundingClientRect();
        for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
            const enemy = enemies[enemyIndex];
            const enemyRect = enemy.getBoundingClientRect();

            if (
                bulletRect.left < enemyRect.left + enemyRect.width &&
                bulletRect.left + bulletRect.width > enemyRect.left &&
                bulletRect.top < enemyRect.top + enemyRect.height &&
                bulletRect.top + bulletRect.height > enemyRect.top
            ) {
                // Collision detected
                gameContainer.removeChild(bullet);
                bullets.splice(bulletIndex, 1);

                gameContainer.removeChild(enemy);
                enemies.splice(enemyIndex, 1);

                score++;
                break; // Stop checking this bullet
            }
        }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const enemyRect = enemy.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        if (
            playerRect.left < enemyRect.left + enemyRect.width &&
            playerRect.left + playerRect.width > enemyRect.left &&
            playerRect.top < enemyRect.top + enemyRect.height &&
            playerRect.top + playerRect.height > enemyRect.top
        ) {
            // Collision with player detected
            gameContainer.removeChild(enemy);
            enemies.splice(i, 1);
            lives--;
            if (lives <= 0) {
                endGame();
            }
        }
    }
}

function updateScoreboard() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
}

function startGame() {
    isGameRunning = true;
    isGamePaused = false;
    startMenu.style.display = 'none';
    gameContainer.style.display = 'block';
    lastTime = performance.now();
    fpsStartTime = lastTime;
    frameCount = 0;
    requestAnimationFrame(gameLoop);
}

function continueGame() {
    if (!isGameRunning) {
        isGameRunning = true;
        lastTime = performance.now();
        fpsStartTime = lastTime;
        frameCount = 0;
        requestAnimationFrame(gameLoop);
    }
}

function restartGame() {
    elapsedTime = 0;
    score = 0;
    lives = 3;
    playerX = 100;
    playerY = 100;
    timeDisplay.textContent = elapsedTime.toFixed(2);
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;

    // Remove all enemies and bullets
    enemies.forEach(enemy => gameContainer.removeChild(enemy));
    enemies.length = 0;
    bullets.forEach(bullet => gameContainer.removeChild(bullet));
    bullets.length = 0;

    isGameRunning = true;
    isGamePaused = false;
    fpsStartTime = performance.now();
    frameCount = 0;
    requestAnimationFrame(gameLoop);
}

function endGame() {
    isGameRunning = false;
    alert("Game Over! Your score: " + score);
}

// Handle player movement and shooting
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        shootBullet();
    } else if (e.key === 'Escape') {
        togglePause();
    }
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

continueButton.addEventListener('click', continueGame);
restartButton.addEventListener('click', restartGame);

startGameButton.addEventListener('click', startGame);
exitGameButton.addEventListener('click', () => {
    startMenu.style.display = 'none';
    alert("Game exited.");
});

resumeGameButton.addEventListener('click', () => {
    isGamePaused = false;
    pauseMenu.style.display = 'none';
    lastTime = performance.now(); // Reset lastTime to prevent large deltaTime
    requestAnimationFrame(gameLoop);
});

restartGameButton.addEventListener('click', () => {
    pauseMenu.style.display = 'none';
    restartGame();
});

exitGamePauseButton.addEventListener('click', () => {
    isGameRunning = false;
    pauseMenu.style.display = 'none';
    alert("Game exited.");
});

function togglePause() {
    if (isGamePaused) {
        isGamePaused = false;
        pauseMenu.style.display = 'none';
        lastTime = performance.now(); // Reset lastTime to prevent large deltaTime
        requestAnimationFrame(gameLoop);
    } else {
        isGamePaused = true;
        pauseMenu.style.display = 'flex';
    }
}

function showStartMenu() {
    startMenu.style.display = 'flex';
    gameContainer.style.display = 'none';
}

showStartMenu();
