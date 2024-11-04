let map = [];       // Contenido del mapa actual
let player = { x: 3, y: 2 }; // Posición inicial
let pokeBalls = 0;  // Contador de Pokébolas
let currentMap = 1; // Número del mapa actual

async function loadMap(mapNumber) {
    const response = await fetch(`maps/map${mapNumber}.txt`);
    const text = await response.text();
    map = text.trim().split('\n');
    pokeBalls = 0;
    player = { x: 3, y: 2 }; // Reinicia la posición del jugador
    renderMap();
}

function renderMap() {
    let renderedMap = map.map((row, y) => {
        if (y === player.y) {
            return row.substring(0, player.x) + '@' + row.substring(player.x + 1);
        } else {
            return row;
        }
    }).join('\n');
    document.getElementById('map').textContent = renderedMap;
    document.getElementById('status').textContent = "Pokébolas: " + pokeBalls;
}

function move(direction) {
    let newX = player.x;
    let newY = player.y;

    if (direction === 'up') newY--;
    if (direction === 'down') newY++;
    if (direction === 'left') newX--;
    if (direction === 'right') newX++;

    // Verificar límites del mapa y si es una pared
    if (map[newY][newX] === '.' || map[newY][newX] === 'o') {
        if (map[newY][newX] === 'o') {
            pokeBalls++;
            map[newY] = map[newY].substring(0, newX) + '.' + map[newY].substring(newX + 1);
        }
        player.x = newX;
        player.y = newY;
    }

    // Si el jugador llega a los límites, carga el siguiente mapa
    if (newY === map.length - 1 && direction === 'down') {
        loadNextMap();
    }

    renderMap();
}

async function loadNextMap() {
    currentMap++;
    await loadMap(currentMap);
}

// Control del teclado
document.addEventListener('keydown', function(event) {
    if (event.key === 'w' || event.key === 'ArrowUp') move('up');
    if (event.key === 's' || event.key === 'ArrowDown') move('down');
    if (event.key === 'a' || event.key === 'ArrowLeft') move('left');
    if (event.key === 'd' || event.key === 'ArrowRight') move('right');
});

// Cargar el primer mapa al iniciar
loadMap(currentMap);
