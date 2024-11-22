let currentPlayer = '';

function startGameSelection() {
    const name = document.getElementById('playerName').value.trim();
    if (name) {
        currentPlayer = name;
        document.getElementById('playerNameDisplay').textContent = name;
        switchScreen('gameSelection');
    } else {
        alert('Please enter your name!');
    }
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function startGame(gameType) {
    if (gameType === 'snake') {
        // Instead of switching screens, redirect to the game's HTML file
        window.location.href = `games/${gameType}/${gameType}.html?player=${encodeURIComponent(currentPlayer)}`;
    } else {
        alert('Game coming soon!');
    }
}