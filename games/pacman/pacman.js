const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const CELL_SIZE = 25;
const BOARD_WIDTH = 19;
const BOARD_HEIGHT = 19;

// Set canvas size
canvas.width = BOARD_WIDTH * CELL_SIZE;
canvas.height = BOARD_HEIGHT * CELL_SIZE;

// Colors
const WALL_COLOR = '#2121DE';
const DOT_COLOR = '#ffffff';
const POWER_DOT_COLOR = '#ffb8ae';
const PACMAN_COLOR = '#FFFF00';

// Simple level layout (smaller for testing)
const LEVEL = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
    [1,1,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,1,1],
    [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
    [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
    [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
    [1,1,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,1,1],
    [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,3,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,3,1],
    [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Game state
let score = 0;
let lives = 3;
let animationFrame = 0;

// Pacman state
const pacman = {
    x: 9,
    y: 11,
    direction: 'right',
    nextDirection: 'right',
    mouthOpen: 0.2,
    speed: 0.15,
    actualX: 9,
    actualY: 11
};

// Update CSS to center the game
document.querySelector('.game-container').style.display = 'flex';
document.querySelector('.game-container').style.flexDirection = 'column';
document.querySelector('.game-container').style.alignItems = 'center';
document.querySelector('.game-container').style.justifyContent = 'center';

function drawWall(x, y) {
    ctx.fillStyle = WALL_COLOR;
    ctx.shadowColor = '#1919B5';
    ctx.shadowBlur = 5;
    ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    ctx.shadowBlur = 0;
}

function drawDot(x, y) {
    ctx.fillStyle = DOT_COLOR;
    ctx.beginPath();
    ctx.arc(
        x * CELL_SIZE + CELL_SIZE/2,
        y * CELL_SIZE + CELL_SIZE/2,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawPowerDot(x, y) {
    ctx.fillStyle = POWER_DOT_COLOR;
    const size = 6 + Math.sin(Date.now() / 200) * 2;
    ctx.beginPath();
    ctx.arc(
        x * CELL_SIZE + CELL_SIZE/2,
        y * CELL_SIZE + CELL_SIZE/2,
        size,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawPacman() {
    ctx.save();
    
    const mouthSize = Math.abs(Math.sin(Date.now() / 100) * 0.5);
    
    const x = pacman.actualX * CELL_SIZE + CELL_SIZE/2;
    const y = pacman.actualY * CELL_SIZE + CELL_SIZE/2;
    
    ctx.translate(x, y);
    
    const rotation = {
        'right': 0,
        'down': Math.PI / 2,
        'left': Math.PI,
        'up': -Math.PI / 2
    };
    ctx.rotate(rotation[pacman.direction]);

    ctx.fillStyle = PACMAN_COLOR;
    ctx.beginPath();
    ctx.arc(0, 0, CELL_SIZE/2 - 2, mouthSize, Math.PI * 2 - mouthSize);
    ctx.lineTo(0, 0);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-2, -8, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawBoard() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#000033');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < LEVEL.length; y++) {
        for (let x = 0; x < LEVEL[y].length; x++) {
            const cell = LEVEL[y][x];
            if (cell === 1) drawWall(x, y);
            else if (cell === 2) drawDot(x, y);
            else if (cell === 3) drawPowerDot(x, y);
        }
    }
}

function updatePacmanPosition() {
    pacman.actualX += (pacman.x - pacman.actualX) * pacman.speed;
    pacman.actualY += (pacman.y - pacman.actualY) * pacman.speed;
}

function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

function gameLoop() {
    drawBoard();
    updatePacmanPosition();
    drawPacman();
    updateScore();
    animationFrame = requestAnimationFrame(gameLoop);
}

// Handle keyboard input with smoother movement
document.addEventListener('keydown', (event) => {
    const key = event.key;
    let newX = Math.round(pacman.x);
    let newY = Math.round(pacman.y);

    switch(key) {
        case 'ArrowUp':
            newY--;
            pacman.direction = 'up';
            break;
        case 'ArrowDown':
            newY++;
            pacman.direction = 'down';
            break;
        case 'ArrowLeft':
            newX--;
            pacman.direction = 'left';
            break;
        case 'ArrowRight':
            newX++;
            pacman.direction = 'right';
            break;
    }

    if (LEVEL[newY] && LEVEL[newY][newX] !== 1) {
        pacman.x = newX;
        pacman.y = newY;

        if (LEVEL[newY][newX] === 2) {
            LEVEL[newY][newX] = 0;
            score += 10;
        }
        else if (LEVEL[newY][newX] === 3) {
            LEVEL[newY][newX] = 0;
            score += 50;
        }
    }
});

// Add CSS for better game container styling
const style = document.createElement('style');
style.textContent = `
    .game-container {
        padding: 20px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 15px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        margin: 20px auto;
    }
    
    #gameCanvas {
        border-radius: 10px;
        box-shadow: 0 0 15px rgba(33, 33, 222, 0.3);
    }
    
    .game-info {
        background: rgba(255, 255, 255, 0.1);
        padding: 10px 20px;
        border-radius: 20px;
        margin: 10px 0;
    }
`;
document.head.appendChild(style);

// Start the game
gameLoop();