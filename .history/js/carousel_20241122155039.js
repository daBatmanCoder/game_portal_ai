let currentGameIndex = 0;
const games = document.querySelectorAll('.game-card');

function moveCarousel(direction) {
    const totalGames = games.length;
    currentGameIndex = (currentGameIndex + direction + totalGames) % totalGames;
    updateCarousel();
}

function updateCarousel() {
    games.forEach((game, index) => {
        const offset = index - currentGameIndex;
        game.style.transform = `translateX(${offset * 320}px)`;
        game.style.opacity = Math.abs(offset) <= 1 ? '1' : '0.5';
    });
}