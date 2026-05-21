const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("scoreBoard");
const restartBtn = document.getElementById("restartBtn");

// Game States
let score = 0;
let gameOver = false;
let gameSpeed = 5; 
let roadOffset = 0;
let isSpeedBoosted = false; 

let coinMultiplierActive = false;
let multiplierTimer = 0;

const player = {
    x: 175, 
    y: 480, 
    width: 45,
    height: 80, 
    horizontalSpeed: 7,
    verticalSpeed: 4 
};

// Arrays for Multiple Objects
let obstacles = [];
let coins = [];
let obstacleTimer = 0;
let coinTimer = 0;

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// --- CONTROLS LISTENERS ---
window.addEventListener("keydown", (e) => { if (e.key in keys) keys[e.key] = true; });
window.addEventListener("keyup", (e) => { if (e.key in keys) keys[e.key] = false; });

function setupMobileButton(buttonId, keyName) {
    const btn = document.getElementById(buttonId);
    if(btn) {
        btn.addEventListener("touchstart", (e) => { e.preventDefault(); keys[keyName] = true; });
        btn.addEventListener("touchend", (e) => { e.preventDefault(); keys[keyName] = false; });
    }
}
setupMobileButton("btnUp", "ArrowUp");
setupMobileButton("btnDown", "ArrowDown");
setupMobileButton("btnLeft", "ArrowLeft");
setupMobileButton("btnRight", "ArrowRight");

// **RESTART BUTTON EVENT**
restartBtn.addEventListener("click", resetGame);
restartBtn.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Mobile touch handling
    resetGame();
});

// **RESET GAME FUNCTION**
function resetGame() {
    score = 0;
    gameOver = false;
    gameSpeed = 5;
    isSpeedBoosted = false;
    coinMultiplierActive = false;
    multiplierTimer = 0;
    
    player.x = 175;
    player.y = 480;
    player.horizontalSpeed = 7;
    
    obstacles = [];
    coins = [];
    obstacleTimer = 0;
    coinTimer = 0;
    
    scoreBoard.innerText = "Score: " + score;
    restartBtn.style.display = "none"; // Button ko wapas छुपा do
    
    update(); // Game loop fir se start
}

// --- DRAW FUNCTIONS ---
function drawCar(x, y, width, height, color, isPlayer = false) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "#000";
    ctx.fillRect(x - 5, y + 10, 5, 15); 
    ctx.fillRect(x + width, y + 10, 5, 15); 
    ctx.fillRect(x - 5, y + height - 25, 5, 15); 
    ctx.fillRect(x + width, y + height - 25, 5, 15); 
    ctx.fillStyle = isPlayer ? "#88ccff" : "#333";
    ctx.fillRect(x + 5, y + 20, width - 10, 15);
}

function drawCoin(x, y, radius) {
    ctx.fillStyle = "#FFD700"; 
    ctx.strokeStyle = "#B8860B"; 
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 12px Arial";
    ctx.fillText("$", x - 4, y + 4);
}

function spawnObstacle() {
    const lanes = [30, 130, 230, 320]; 
    const lane1 = lanes[Math.floor(Math.random() * lanes.length)];
    let lane2 = lanes[Math.floor(Math.random() * lanes.length)];
    
    obstacles.push({ x: lane1, y: -100, width: 45, height: 80, color: `hsl(${Math.random() * 360}, 80%, 50%)` });

    if (Math.random() < 0.4 && lane1 !== lane2) {
        obstacles.push({ x: lane2, y: -150, width: 45, height: 80, color: `hsl(${Math.random() * 360}, 80%, 50%)` });
    }
}

function spawnCoin() {
    const lanes = [50, 150, 250, 340];
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
    coins.push({ x: randomLane, y: -50, radius: 12 });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
}

function checkCarCoinCollision(car, coin) {
    let closestX = Math.max(car.x, Math.min(coin.x, car.x + car.width));
    let closestY = Math.max(car.y, Math.min(coin.y, car.y + car.height));
    let distanceX = coin.x - closestX;
    let distanceY = coin.y - closestY;
    return ((distanceX * distanceX) + (distanceY * distanceY)) < (coin.radius * coin.radius);
}

// --- MAIN GAME LOOP ---
function update() {
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 35px Arial";
        ctx.fillText("GAME OVER", 95, 230);
        
        ctx.font = "20px Arial";
        ctx.fillStyle = "#FFD700";
        ctx.fillText("Final Score: " + score, 130, 280);
        
        restartBtn.style.display = "block"; // Game Over hote hi button show karo
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentSpeed = gameSpeed;
    if (keys.ArrowUp) {
        currentSpeed = gameSpeed + 3;
        if (player.y > 100) player.y -= player.verticalSpeed;
    }
    if (keys.ArrowDown) {
        currentSpeed = gameSpeed - 2;
        if (player.y < canvas.height - player.height - 20) player.y += player.verticalSpeed;
    }
    if (currentSpeed < 1) currentSpeed = 1;

    roadOffset += currentSpeed;
    if (roadOffset > 40) roadOffset = 0;

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -roadOffset;
    ctx.beginPath();
    ctx.moveTo(133, 0); ctx.lineTo(133, canvas.height);
    ctx.moveTo(266, 0); ctx.lineTo(266, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    if (keys.ArrowLeft && player.x > 10) player.x -= player.horizontalSpeed;
    if (keys.ArrowRight && player.x < canvas.width - player.width - 10) player.x += player.horizontalSpeed;

    drawCar(player.x, player.y, player.width, player.height, "#ff2222", true);

    obstacleTimer++;
    if (obstacleTimer % 75 === 0) spawnObstacle();

    coinTimer++;
    if (coinTimer % 130 === 0) spawnCoin();

    if (coinMultiplierActive) {
        multiplierTimer--;
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 16px Arial";
        ctx.fillText("2X SCORE ACTIVE!", 20, 40);
        if (multiplierTimer <= 0) coinMultiplierActive = false;
    }

    for (let i = coins.length - 1; i >= 0; i--) {
        let c = coins[i];
        c.y += currentSpeed - 1;
        drawCoin(c.x, c.y, c.radius);

        if (checkCarCoinCollision(player, c)) {
            coins.splice(i, 1);
            coinMultiplierActive = true;
            multiplierTimer = 300; 
            score += 2; 
            scoreBoard.innerText = "Score: " + score;
            continue;
        }
        if (c.y > canvas.height) coins.splice(i, 1);
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.y += currentSpeed - 1; 
        drawCar(obs.x, obs.y, obs.width, obs.height, obs.color, false);

        if (checkCollision(player, obs)) {
            gameOver = true;
        }

        if (obs.y > canvas.height) {
            obstacles.splice(i, 1);
            score += coinMultiplierActive ? 2 : 1;
            scoreBoard.innerText = "Score: " + score;

            if (score >= 20 && !isSpeedBoosted) {
                gameSpeed += 3; 
                isSpeedBoosted = true; 
                player.horizontalSpeed += 1.5; 
            }
            if (score % 7 === 0) gameSpeed += 0.3;
        }
    }

    requestAnimationFrame(update);
}

update();
