const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 400;
canvas.height = 400;

// Game constants
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game variables
let snake = [
    { x: 10, y: 10 }
];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = 0;
let gameSpeed = 100;
let gameLoop;

// Initialize game
function startGame() {
    // Initial setup
    snake = [{ x: 10, y: 10 }];
    food = { x: 5, y: 5 };
    dx = 0;
    dy = 0;
    score = 0;
    
    updateScore();
    createFood();
    
    // Draw initial state
    draw();
    
    // Clear any existing event listeners to prevent duplicates
    document.removeEventListener('keydown', changeDirection);
    document.addEventListener('keydown', changeDirection);
    
    // Clear any existing game loop
    clearInterval(gameLoop);
    gameLoop = setInterval(update, gameSpeed);
}

// Update game state
function update() {
    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Don't update if snake isn't moving yet
    if (dx === 0 && dy === 0) {
        return;
    }
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Check self collision - start checking from index 1 to avoid false collision with head
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        createFood();
    } else {
        snake.pop();
    }
    
    draw();
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines (optional but helps visibility)
    ctx.strokeStyle = '#333';
    for(let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw snake
    ctx.fillStyle = 'lime';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
    
    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// Handle direction changes
function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    
    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;
    
    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

// Create new food at random position
function createFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    // Make sure food doesn't appear on snake
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            createFood();
        }
    });
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
}

// Game over handling
function gameOver() {
    clearInterval(gameLoop);
    alert(`Game Over! Your score: ${score}`);
    
    // Reset game state
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    updateScore();
    createFood();
    
    // Restart the game loop
    gameLoop = setInterval(update, gameSpeed);
    
    // Initial draw to show the reset state
    draw();
}

// Start the game
startGame(); 