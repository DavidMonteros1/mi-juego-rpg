let map = [];       // Contenido del mapa actual
let player = { x: 3, y: 2 }; // Posición inicial
let pokeBalls = 0;  // Contador de Pokébolas
let currentMap = 1; // Número del mapa actual
const viewportWidth = 40;
const viewportHeight = 20;

async function loadMap(mapNumber) {
    try {
        const response = await fetch(`maps/map${mapNumber}.txt`);
        if (!response.ok) {
            throw new Error('Mapa no encontrado');
        }
        const text = await response.text();
        map = text.trim().split('\n');
        pokeBalls = 0;
        player = { x: 3, y: 2 }; // Reinicia la posición del jugador
        renderMap();
    } catch (error) {
        alert(error.message);
    }
}

function renderMap() {
    const startX = Math.max(0, player.x - Math.floor(viewportWidth / 2));
    const startY = Math.max(0, player.y - Math.floor(viewportHeight / 2));
    const endX = Math.min(startX + viewportWidth, map[0].length);
    const endY = Math.min(startY + viewportHeight, map.length);

    let renderedMap = '';
    for (let y = startY; y < endY; y++) {
        let row = map[y];
        if (y === player.y) {
            row = row.substring(0, player.x) + '@' + row.substring(player.x + 1);
        }
        renderedMap += row.slice(startX, endX) + '\n';
    }

    document.getElementById('map').textContent = renderedMap;
    document.getElementById('status').textContent = "Pokébolas: " + pokeBalls;
    document.getElementById('position').textContent = `Posición: X${player.x} Y${player.y}`;
}

function move(direction) {
    let newX = player.x;
    let newY = player.y;

    if (direction === 'up') newY--;
    if (direction === 'down') newY++;
    if (direction === 'left') newX--;
    if (direction === 'right') newX++;

    // Verificar límites del mapa y si es una pared
    if (map[newY] && (map[newY][newX] === '.' || map[newY][newX] === 'o' || map[newY][newX] === 'M')) {
        // Verificar si el jugador ha encontrado una Pokébola
        if (map[newY][newX] === 'o') {
            pokeBalls++;
            map[newY] = map[newY].substring(0, newX) + '.' + map[newY].substring(newX + 1);
        }

        // Verificar si el jugador ha encontrado un mapa
        if (map[newY][newX] === 'M') {
            loadSpecificMap(newX, newY);
            return; // Salir de la función para evitar mover al jugador
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

function loadSpecificMap(x, y) {
    // Cargar un mapa específico basado en la posición del carácter 'M'
    if (x === 16 && y === 20) {
        currentMap = 2; // Por ejemplo, asignar el mapa 2
    } else {
        return; // Salir si no hay un mapa asignado
    }

    loadMap(currentMap);
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
