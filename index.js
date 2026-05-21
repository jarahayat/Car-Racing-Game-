const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("scoreBoard");

// Game State Variables
let score = 0;
let gameOver = false;
let gameSpeed = 5; 

// Road Line Offset for Animation
let roadOffset = 0;

// Player Car Object
const player = {
    x: 175, 
    y: 480, 
    width: 45,
    height: 80, 
    horizontalSpeed: 7,
    verticalSpeed: 4 
};

// Enemy Cars Array
let obstacles = [];
let obstacleTimer = 0;

// Key Controls State
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// Control Event Listeners
window.addEventListener("keydown", (e) => {
    if (e.key in keys) keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    if (e.key in keys) keys[e.key] = false;
});

// Spawn Enemy Cars Function
function spawnObstacle() {
    const lanes = [30, 130, 230, 320]; 
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
    
    obstacles.push({
        x: randomLane,
        y: -100,
        width: 45,
        height: 80,
        color: `hsl(${Math.random() * 360}, 80%, 50%)` // Har baar alag color ki enemy car
    });
}

// Collision Detection Logic
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Helper function to draw styled cars without images
function drawCar(x, y, width, height, color, isPlayer = false) {
    // Car Main Body
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    
    // Wheels (4 Black rectangles)
    ctx.fillStyle = "#000";
    ctx.fillRect(x - 5, y + 10, 5, 15); // Top Left
    ctx.fillRect(x + width, y + 10, 5, 15); // Top Right
    ctx.fillRect(x - 5, y + height - 25, 5, 15); // Bottom Left
    ctx.fillRect(x + width, y + height - 25, 5, 15); // Bottom Right

    // Windshield / Glass (Blue/White box)
    ctx.fillStyle = isPlayer ? "#88ccff" : "#333";
    ctx.fillRect(x + 5, y + 20, width - 10, 15);
}

// Main Game Loop
function update() {
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 35px Arial";
        ctx.fillText("GAME OVER", 95, 260);
        
        ctx.font = "20px Arial";
        ctx.fillStyle = "#aaaaaa";
        ctx.fillText("Refresh the page to restart", 85, 310);
        return;
    }

    // Clear Screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // *** ROAD ANIMATION LOGIC ***
    // Dynamic Speed adjustment based on Up/Down keys
    let currentSpeed = gameSpeed;
    if (keys.ArrowUp) {
        currentSpeed = gameSpeed + 3;
        if (player.y > 100) player.y -= player.verticalSpeed; // Move car up
    }
    if (keys.ArrowDown) {
        currentSpeed = gameSpeed - 2;
        if (player.y < canvas.height - player.height - 20) player.y += player.verticalSpeed; // Move car down
    }
    if (currentSpeed < 1) currentSpeed = 1;

    // Moving road lines calculation
    roadOffset += currentSpeed;
    if (roadOffset > 40) roadOffset = 0; // Reset after one line dash loop

    // Draw Moving Road Lines
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -roadOffset; // Moving effect link
    
    ctx.beginPath();
    ctx.moveTo(133, 0); ctx.lineTo(133, canvas.height);
    ctx.moveTo(266, 0); ctx.lineTo(266, canvas.height);
    ctx.stroke();

    // Reset Line Dash for cars drawing
    ctx.setLineDash([]);

    // Left/Right Steering Movement
    if (keys.ArrowLeft && player.x > 10) {
        player.x -= player.horizontalSpeed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width - 10) {
        player.x += player.horizontalSpeed;
    }

    // Draw Player Red Styled Car
    drawCar(player.x, player.y, player.width, player.height, "#ff2222", true);

    // Enemy Cars Spawning & Movement
    obstacleTimer++;
    if (obstacleTimer % 90 === 0) {
        spawnObstacle();
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        
        // Enemy car runs toward player based on current road speed
        obs.y += currentSpeed - 1; 

        // Draw Enemy Styled Car
        drawCar(obs.x, obs.y, obs.width, obs.height, obs.color, false);

        // Check for Crash
        if (checkCollision(player, obs)) {
            gameOver = true;
        }

        // Score Check & Cleanup
        if (obs.y > canvas.height) {
            obstacles.splice(i, 1);
            score++;
            scoreBoard.innerText = "Score: " + score;
            
            if (score % 5 === 0) {
                gameSpeed += 0.5; // Difficulty increases
            }
        }
    }

    requestAnimationFrame(update);
}

// Start Game directly
update();