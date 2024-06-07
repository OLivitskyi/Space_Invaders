const gameContainer = document.getElementById('game-container');
const menu = document.getElementById('menu');
const continueButton = document.getElementById('continue');
const restartButton = document.getElementById('restart');
const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');

const player = document.createElement('div');
player.id = 'player';
gameContainer.appendChild(player);

let lastTime = 0;
let elapsedTime = 0;
let score = 0;
let lives = 3;
let isGameRunning = false;
let playerX = 100;
let playerY = 100;
const playerSpeed = 200; // pixels per second

const enemies = [];
const bullets = [];
const bulletSpeed = 300; // pixels per second
const enemySpeed = 100; // pixels per second
const enemySpawnInterval = 2000; // milliseconds
let enemySpawnTimer = 0;

function gameLoop(timestamp) {
    if (!isGameRunning) return;

    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    elapsedTime += deltaTime;
    timeDisplay.textContent = elapsedTime.toFixed(2);

    updatePlayerPosition(deltaTime);

    enemySpawnTimer += deltaTime * 1000;
    if (enemySpawnTimer > enemySpawnInterval) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }

    updateEnemiesPosition(deltaTime);

    updateBulletsPosition(deltaTime);

    checkCollisions();

    updateScoreboard();


    requestAnimationFrame(gameLoop);
}

function updatePlayerPosition(deltaTime) {
    if (keys.ArrowUp) playerY -= playerSpeed * deltaTime;
    if (keys.ArrowDown) playerY += playerSpeed * deltaTime;
    if (keys.ArrowLeft) playerX -= playerSpeed * deltaTime;
    if (keys.ArrowRight) playerX += playerSpeed * deltaTime;

    // Ensure player stays within the game container bounds
    const menuWidth = menu.offsetWidth;
    const scoreboardHeight = document.getElementById('scoreboard').offsetHeight;

    playerX = Math.max(menuWidth, Math.min(gameContainer.clientWidth - player.offsetWidth, playerX));
    playerY = Math.max(scoreboardHeight, Math.min(gameContainer.clientHeight - player.offsetHeight, playerY));

    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
}

function spawnEnemy() {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.left = `${Math.random() * (gameContainer.clientWidth - 40)}px`;
    enemy.style.top = `${-40}px`;
    gameContainer.appendChild(enemy);
    enemies.push(enemy);
}

function updateEnemiesPosition(deltaTime) {
    enemies.forEach((enemy, index) => {
        const enemyY = parseFloat(enemy.style.top);
        enemy.style.top = `${enemyY + enemySpeed * deltaTime}px`;

        // Remove enemy if it goes out of bounds
        if (enemyY > gameContainer.clientHeight) {
            gameContainer.removeChild(enemy);
            enemies.splice(index, 1);
            // Deduct a life for missed enemy
            lives--;
            if (lives <= 0) {
                endGame();
            }
        }
    });
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
    bullets.forEach((bullet, index) => {
        const bulletY = parseFloat(bullet.style.top);
        bullet.style.top = `${bulletY - bulletSpeed * deltaTime}px`;

        // Remove bullet if it goes out of bounds
        if (bulletY < 0) {
            gameContainer.removeChild(bullet);
            bullets.splice(index, 1);
        }
    });
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        const bulletRect = bullet.getBoundingClientRect();
        enemies.forEach((enemy, enemyIndex) => {
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
            }
        });
    });

    enemies.forEach((enemy, index) => {
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
            enemies.splice(index, 1);
            lives--;
            if (lives <= 0) {
                endGame();
            }
        }
    });
}

function updateScoreboard() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
}

function startGame() {
    isGameRunning = true;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function continueGame() {
    if (!isGameRunning) {
        isGameRunning = true;
        lastTime = performance.now();
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

    enemies.forEach(enemy => gameContainer.removeChild(enemy));
    enemies.length = 0;
    bullets.forEach(bullet => gameContainer.removeChild(bullet));
    bullets.length = 0;

    isGameRunning = true;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    isGameRunning = false;
    alert("Game Over! Your score: " + score);
}

const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        shootBullet();
    }
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

continueButton.addEventListener('click', continueGame);
restartButton.addEventListener('click', restartGame);

startGame();
