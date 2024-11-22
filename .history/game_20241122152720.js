let scene, camera, renderer, snake, food;
let gridSize = 20;
let gridDivisions = 20;
let speed = 15;
let direction = new THREE.Vector3(1, 0, 0);
let newDirection = new THREE.Vector3(1, 0, 0);
let snakeBody = [];
let gameStarted = false;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.getElementById('gameContainer').appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 20, 20);
    scene.add(directionalLight);

    // Create game board
    createGameBoard();
    
    // Create initial snake
    createSnake();
    
    // Create food
    createFood();

    // Position camera
    camera.position.set(0, 30, 0);
    camera.lookAt(0, 0, 0);

    // Event listeners
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onWindowResize);

    // Start game loop
    animate();
}

function createGameBoard() {
    // Create grid
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x444444);
    scene.add(gridHelper);

    // Create walls
    const wallGeometry = new THREE.BoxGeometry(gridSize, gridSize/2, 1);
    const wallMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x0088ff,
        transparent: true,
        opacity: 0.3
    });

    // Add walls
    const walls = [];
    for(let i = 0; i < 4; i++) {
        walls[i] = new THREE.Mesh(wallGeometry, wallMaterial);
    }

    walls[0].position.set(0, gridSize/4, gridSize/2);
    walls[1].position.set(0, gridSize/4, -gridSize/2);
    walls[2].rotation.y = Math.PI/2;
    walls[2].position.set(gridSize/2, gridSize/4, 0);
    walls[3].rotation.y = Math.PI/2;
    walls[3].position.set(-gridSize/2, gridSize/4, 0);

    walls.forEach(wall => scene.add(wall));
}

function createSnake() {
    const geometry = new THREE.SphereGeometry(0.4);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    snake = new THREE.Mesh(geometry, material);
    snake.position.set(0, 0.4, 0);
    scene.add(snake);
    snakeBody = [snake.position.clone()];
}

function createFood() {
    const geometry = new THREE.OctahedronGeometry(0.4);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5
    });
    food = new THREE.Mesh(geometry, material);
    repositionFood();
    scene.add(food);
}

function repositionFood() {
    const x = Math.floor(Math.random() * gridDivisions - gridDivisions/2);
    const z = Math.floor(Math.random() * gridDivisions - gridDivisions/2);
    food.position.set(x, 0.4, z);
}

function moveSnake() {
    if (!gameStarted) return;

    direction.copy(newDirection);
    const newPosition = snake.position.clone();
    newPosition.add(direction.multiplyScalar(1));

    // Check bounds
    if (Math.abs(newPosition.x) > gridSize/2) {
        newPosition.x = -Math.sign(newPosition.x) * gridSize/2;
    }
    if (Math.abs(newPosition.z) > gridSize/2) {
        newPosition.z = -Math.sign(newPosition.z) * gridSize/2;
    }

    // Update snake body
    snakeBody.unshift(snake.position.clone());
    snake.position.copy(newPosition);

    // Check food collision
    if (snake.position.distanceTo(food.position) < 1) {
        repositionFood();
    } else {
        snakeBody.pop();
    }

    // Update tail segments
    updateSnakeBody();
}

function updateSnakeBody() {
    // Remove old segments
    scene.children = scene.children.filter(child => 
        child !== snake && child.userData.type !== 'snakeSegment'
    );

    // Add new segments
    snakeBody.forEach((position, index) => {
        if (index === 0) return; // Skip head
        const geometry = new THREE.SphereGeometry(0.3);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            opacity: 1 - (index / snakeBody.length),
            transparent: true
        });
        const segment = new THREE.Mesh(geometry, material);
        segment.position.copy(position);
        segment.userData.type = 'snakeSegment';
        scene.add(segment);
    });
}

function onKeyDown(event) {
    gameStarted = true;
    switch(event.keyCode) {
        case 37: // left
            if (direction.x === 0) newDirection.set(-1, 0, 0);
            break;
        case 39: // right
            if (direction.x === 0) newDirection.set(1, 0, 0);
            break;
        case 38: // up
            if (direction.z === 0) newDirection.set(0, 0, -1);
            break;
        case 40: // down
            if (direction.z === 0) newDirection.set(0, 0, 1);
            break;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (gameStarted) {
        if (frame % speed === 0) {
            moveSnake();
        }
        frame++;
    }

    // Rotate food
    if (food) {
        food.rotation.y += 0.05;
        food.rotation.x += 0.05;
    }

    renderer.render(scene, camera);
}

let frame = 0;
init(); 