let map = []; // Contenido del mapa actual
let player = { x: 3, y: 2 }; // Posición inicial del jugador
let pokeBalls = 0; // Contador de Pokébolas
let currentMap = 1; // Número del mapa actual
const viewport = { width: 40, height: 20 }; // Tamaño de la "ventana" de visualización

async function loadMap(mapNumber) {
    try {
        const response = await fetch(`maps/map${mapNumber}.txt`);
        if (!response.ok) {
            throw new Error('Mapa no encontrado');
        }
        const text = await response.text();
        map = text.trim().split('\n');
        renderMap();
    } catch (error) {
        alert(error.message);
    }
}

function renderMap() {
    // Determinar los límites de la ventana de visualización alrededor del jugador
    const startX = Math.max(0, player.x - Math.floor(viewport.width / 2));
    const startY = Math.max(0, player.y - Math.floor(viewport.height / 2));
    const endX = Math.min(map[0].length, startX + viewport.width);
    const endY = Math.min(map.length, startY + viewport.height);

    // Renderizar solo el área visible del mapa
    let renderedMap = '';
    for (let y = startY; y < endY; y++) {
        let row = map[y].substring(startX, endX);
        if (y === player.y) {
            row = row.substring(0, player.x - startX) + '@' + row.substring(player.x - startX + 1);
        }
        renderedMap += row + '\n';
    }

    document.getElementById('map').textContent = renderedMap;
    document.getElementById('status').textContent = `Pokébolas: ${pokeBalls} | Posición: X${player.x} Y${player.y}`;
}

function move(direction) {
    let newX = player.x;
    let newY = player.y;

    if (direction === 'up') newY--;
    if (direction === 'down') newY++;
    if (direction === 'left') newX--;
    if (direction === 'right') newX++;

    if (map[newY] && (map[newY][newX] === '.' || map[newY][newX] === 'o' || map[newY][newX] === 'M')) {
        if (map[newY][newX] === 'o') {
            pokeBalls++;
            map[newY] = map[newY].substring(0, newX) + '.' + map[newY].substring(newX + 1);
        }

        if (map[newY][newX] === 'M') {
            loadSpecificMap(newX, newY);
            return;
        }

        player.x = newX;
        player.y = newY;
    }

    renderMap();
}

function loadSpecificMap(x, y) {
    if (x === 16 && y === 20) {
        currentMap = 2;
    } else {
        return;
    }

    loadMap(currentMap);
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
