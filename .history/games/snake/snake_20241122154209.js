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

// Add new constants for graphics
const snakeGradient = {
    body: ['#4CAF50', '#45a049'],
    head: ['#8BC34A', '#7CB342']
};
const foodGradient = ['#f44336', '#e53935'];
const gridColor = '#1a1a1a';
const backgroundColor = '#000000';

// Initialize game
function startGame() {
    // Initial setup with random snake position
    const randomX = Math.floor(Math.random() * tileCount);
    const randomY = Math.floor(Math.random() * tileCount);
    snake = [{ x: randomX, y: randomY }];
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
    let head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Don't update if snake isn't moving yet
    if (dx === 0 && dy === 0) {
        return;
    }
    
    // Wrap around borders
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;
    
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
    // Clear canvas with a dark background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines with alpha for subtle effect
    ctx.strokeStyle = gridColor;
    ctx.globalAlpha = 0.2;
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
    ctx.globalAlpha = 1;
    
    // Draw snake with gradient and rounded corners
    snake.forEach((segment, index) => {
        const gradient = ctx.createRadialGradient(
            (segment.x * gridSize) + gridSize/2, 
            (segment.y * gridSize) + gridSize/2, 
            0,
            (segment.x * gridSize) + gridSize/2, 
            (segment.y * gridSize) + gridSize/2, 
            gridSize/1.5
        );
        
        // Different gradient for head vs body
        const colors = index === 0 ? snakeGradient.head : snakeGradient.body;
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        
        ctx.fillStyle = gradient;
        
        // Draw rounded rectangle for each segment
        roundedRect(
            ctx,
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2,
            5
        );
    });
    
    // Draw food with pulsing effect and gradient
    const pulseSize = Math.sin(Date.now() / 200) * 2;
    const foodGrad = ctx.createRadialGradient(
        (food.x * gridSize) + gridSize/2,
        (food.y * gridSize) + gridSize/2,
        0,
        (food.x * gridSize) + gridSize/2,
        (food.y * gridSize) + gridSize/2,
        gridSize/1.5
    );
    
    foodGrad.addColorStop(0, foodGradient[0]);
    foodGrad.addColorStop(1, foodGradient[1]);
    ctx.fillStyle = foodGrad;
    
    roundedRect(
        ctx,
        food.x * gridSize + 1 - pulseSize/2,
        food.y * gridSize + 1 - pulseSize/2,
        gridSize - 2 + pulseSize,
        gridSize - 2 + pulseSize,
        5
    );
}

// Helper function to draw rounded rectangles
function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
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