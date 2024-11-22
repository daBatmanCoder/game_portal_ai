const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 300;
canvas.height = 600;

const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Colors for pieces
const COLORS = [
    'black',
    'cyan',    // I
    'blue',    // J
    'orange',  // L
    'yellow',  // O
    'green',   // S
    'purple',  // T
    'red'      // Z
];

// Tetromino shapes
const SHAPES = {
    I: [[0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]],
    
    J: [[2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]],
    
    L: [[0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]],
    
    O: [[4, 4],
        [4, 4]],
    
    S: [[0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]],
    
    T: [[0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]],
    
    Z: [[7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]]
};

let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let score = 0;
let level = 1;
let dropInterval = 1000;
let lastDrop = 0;
let gameOver = false;

// Current piece
let currentPiece = null;
let currentPiecePosition = { x: 0, y: 0 };

function createPiece() {
    const pieces = 'IJLOSTZ';
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    const shape = SHAPES[randomPiece];
    return {
        shape,
        position: {
            x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
            y: 0
        }
    };
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                drawBlock(x, y, COLORS[board[y][x]]);
            }
        }
    }

    // Draw current piece
    if (currentPiece) {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(
                        x + currentPiece.position.x,
                        y + currentPiece.position.y,
                        COLORS[value]
                    );
                }
            });
        });
    }

    // Draw grid
    ctx.strokeStyle = '#333';
    for (let i = 0; i <= BOARD_WIDTH; i++) {
        ctx.beginPath();
        ctx.moveTo(i * BLOCK_SIZE, 0);
        ctx.lineTo(i * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= BOARD_HEIGHT; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * BLOCK_SIZE);
        ctx.lineTo(canvas.width, i * BLOCK_SIZE);
        ctx.stroke();
    }
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
}

function collision() {
    if (!currentPiece) return false;
    
    return currentPiece.shape.some((row, y) => {
        return row.some((value, x) => {
            if (!value) return false;
            const boardX = x + currentPiece.position.x;
            const boardY = y + currentPiece.position.y;
            
            return (
                boardX < 0 ||
                boardX >= BOARD_WIDTH ||
                boardY >= BOARD_HEIGHT ||
                (boardY >= 0 && board[boardY][boardX])
            );
        });
    });
}

function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const boardY = y + currentPiece.position.y;
                const boardX = x + currentPiece.position.x;
                if (boardY >= 0) {
                    board[boardY][boardX] = value;
                }
            }
        });
    });
}

function moveDown() {
    currentPiece.position.y++;
    if (collision()) {
        currentPiece.position.y--;
        merge();
        clearLines();
        if (currentPiece.position.y <= 0) {
            // Game Over
            gameOver = true;
            alert('Game Over! Score: ' + score);
            resetGame();
            return;
        }
        currentPiece = createPiece();
    }
}

function moveLeft() {
    currentPiece.position.x--;
    if (collision()) {
        currentPiece.position.x++;
    }
}

function moveRight() {
    currentPiece.position.x++;
    if (collision()) {
        currentPiece.position.x--;
    }
}

function rotate() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;
    
    if (collision()) {
        currentPiece.shape = previousShape;
    }
}

function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(value => value !== 0)) {
            // Remove the line
            board.splice(y, 1);
            // Add new empty line at top
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++; // Check the same line again
        }
    }
    
    if (linesCleared > 0) {
        score += linesCleared * 100 * level;
        document.getElementById('score').textContent = score;
        
        // Level up every 10 lines
        const newLevel = Math.floor(score / 1000) + 1;
        if (newLevel > level) {
            level = newLevel;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
            document.getElementById('level').textContent = level;
        }
    }
}

function resetGame() {
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    level = 1;
    dropInterval = 1000;
    gameOver = false;
    currentPiece = createPiece();
    document.getElementById('score').textContent = '0';
    document.getElementById('level').textContent = '1';
}

function update(timestamp) {
    if (gameOver) return;

    if (timestamp - lastDrop > dropInterval) {
        moveDown();
        lastDrop = timestamp;
    }
    
    draw();
    requestAnimationFrame(update);
}

// Controls
document.addEventListener('keydown', event => {
    if (gameOver) return;

    switch (event.keyCode) {
        case 37: // Left arrow
            moveLeft();
            break;
        case 39: // Right arrow
            moveRight();
            break;
        case 40: // Down arrow
            moveDown();
            break;
        case 38: // Up arrow
            rotate();
            break;
        case 32: // Space - Hard drop
            while (!collision()) {
                currentPiece.position.y++;
            }
            currentPiece.position.y--;
            moveDown();
            break;
    }
});

// Start game
resetGame();
requestAnimationFrame(update); 