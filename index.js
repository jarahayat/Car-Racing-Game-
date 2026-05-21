const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("scoreBoard");

// Game States
let score = 0;
let gameOver = false;
let gameSpeed = 5; 
let roadOffset = 0;

const player = {
    x: 175, 
    y: 480, 
    width: 45,
    height: 80, 
    horizontalSpeed: 7,
    verticalSpeed: 4 
};

let obstacles = [];
let obstacleTimer = 0;

// Central Controls State
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// --- 1. DESKTOP KEYBOARD CONTROLS ---
window.addEventListener("keydown", (e) => {
    if (e.key in keys) keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    if (e.key in keys) keys[e.key] = false;
});

// --- 2. MOBILE TOUCH CONTROLS ---
function setupMobileButton(buttonId, keyName) {
    const btn = document.getElementById(buttonId);
    
    // Jab touch karein
    btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        keys[keyName] = true;
    });
    
    // Jab touch hatayein
    btn.addEventListener("touchend", (e) => {
        e.preventDefault();
        keys[keyName] = false;
    });
}

// Mapping buttons to game logic keys
setupMobileButton("btnUp", "ArrowUp");
setupMobileButton("btnDown", "ArrowDown");
setupMobileButton("btnLeft", "ArrowLeft");
setupMobileButton("btnRight", "ArrowRight");


// Restart on Mobile Tap when Game Over
window.addEventListener("touchstart", () => {
    if (gameOver) {
        document.location.reload();
    }
});

// Function to draw styled cars
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

function spawnObstacle() {
    const lanes = [30, 130, 230, 320]; 
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
    
    obstacles.push({
        x: randomLane,
        y: -100,
        width: 45,
        height: 80,
        color: `hsl(${Math.random() * 360}, 80%, 50%)`
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Main Game Loop
function update() {
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 30px Arial";
        ctx.fillText("GAME OVER", 110, 260);
        
        ctx.font = "18px Arial";
        ctx.fillStyle = "#aaaaaa";
        ctx.fillText("Tap screen to restart", 115, 310);
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

    if (keys.ArrowLeft && player.x > 10) {
        player.x -= player.horizontalSpeed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width - 10) {
        player.x += player.horizontalSpeed;
    }

    drawCar(player.x, player.y, player.width, player.height, "#ff2222", true);

    obstacleTimer++;
    if (obstacleTimer % 90 === 0) {
        spawnObstacle();
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
            score++;
            scoreBoard.innerText = "Score: " + score;
            if (score % 5 === 0) gameSpeed += 0.5;
        }
    }

    requestAnimationFrame(update);
}

update();
