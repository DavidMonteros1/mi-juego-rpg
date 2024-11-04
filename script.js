let map = [];
let player = { x: 3, y: 2, hp: 100, hunger: 0, level: 1, exp: 0, gold: 0, direction: 'right' };
let enemies = [];
let currentMap = 1;
const viewportWidth = 30;
const viewportHeight = 15;

function createEnemy(x, y, level) {
    return { x, y, hp: 10 * level, attack: 2 * level, defense: 1 * level, level, lastMove: Date.now() };
}

function randomPosition() {
    let x, y;
    do {
        x = Math.floor(Math.random() * map[0].length);
        y = Math.floor(Math.random() * map.length);
    } while (map[y][x] !== '.');
    return { x, y };
}

async function loadMap(mapNumber) {
    try {
        const response = await fetch(`maps/map${mapNumber}.txt`);
        if (!response.ok) {
            throw new Error('Mapa no encontrado');
        }
        const text = await response.text();
        map = text.trim().split('\n');
        enemies = []; // Reinicia los enemigos
        if (mapNumber === 1) {
            let pos = randomPosition();
            enemies.push(createEnemy(pos.x, pos.y, 1));
        } else if (mapNumber === 2) {
            let pos = randomPosition();
            enemies.push(createEnemy(pos.x, pos.y, 2));
        }
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
        if (y === player.y && !attacking) {
            row = row.substring(0, player.x) + '@' + row.substring(player.x + 1);
        }
        enemies.forEach(enemy => {
            if (enemy.y === y) {
                row = row.substring(0, enemy.x) + enemySymbol(enemy.level) + row.substring(enemy.x + 1);
            }
        });
        renderedMap += row.slice(startX, endX) + '\n';
    }

    document.getElementById('map').textContent = renderedMap;
    document.getElementById('info').innerHTML = `Estado: Vida ${player.hp} | Hambre ${player.hunger} | Nivel ${player.level} | Exp ${player.exp}<br>
        Inventario: Oro ${player.gold}<br>
        Posición: X${player.x} Y${player.y} | Mapa ${currentMap}`;
}

let attacking = false;

function move(direction) {
    const directions = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
    const [deltaY, deltaX] = directions[direction] || [0, 0];
    const newX = player.x + deltaX;
    const newY = player.y + deltaY;
    player.direction = direction;

    if (map[newY] && (map[newY][newX] === '.' || map[newY][newX] === 'o' || map[newY][newX] === 'M')) {
        if (map[newY][newX] === 'o') {
            player.gold++;
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
    if (currentMap === 1 && x === 16 && y === 20) {
        currentMap = 2;
    } else if (currentMap === 2 && x === 16 && y === 20) {
        currentMap = 1;
    } else {
        return;
    }

    loadMap(currentMap);
}

async function loadNextMap() {
    currentMap++;
    await loadMap(currentMap);
}

function attack() {
    if (attacking) return;
    attacking = true;

    let attackPosition = { x: player.x, y: player.y };
    const directions = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
    const [deltaY, deltaX] = directions[player.direction] || [0, 0];
    attackPosition.x += deltaX;
    attackPosition.y += deltaY;

    let originalChar = map[attackPosition.y][attackPosition.x];
    map[attackPosition.y] = map[attackPosition.y].substring(0, attackPosition.x) + (player.direction === 'right' ? '→' : player.direction === 'left' ? '←' : player.direction === 'up' ? '↑' : '↓') + map[attackPosition.y].substring(attackPosition.x + 1);

    enemies.forEach(enemy => {
        if (enemy.x === attackPosition.x && enemy.y === attackPosition.y) {
            enemy.hp -= (10 + player.level * 2) - enemy.defense; // Cálculo de daño básico
            if (enemy.hp <= 0) {
                player.gold += enemy.level * 10;
                player.exp += enemy.level * 5;
                enemies = enemies.filter(e => e !== enemy);
            } else {
                player.hp -= enemy.attack; // Enemigo ataca de vuelta
            }
        }
    });

    renderMap();

    setTimeout(() => {
        map[attackPosition.y] = map[attackPosition.y].substring(0, attackPosition.x) + originalChar + map[attackPosition.y].substring(attackPosition.x + 1);
        attacking = false;
        renderMap();
    }, 500); // El ataque dura 0.5 segundos
}

function enemyMove(enemy) {
    const directions = ['up', 'down', 'left', 'right'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const moveVectors = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [1, 0] };
    const [deltaY, deltaX] = moveVectors[direction];
    const newX = enemy.x + deltaX;
    const newY = enemy.y + deltaY;

    if (map[newY] && map[newY][newX] === '.') {
        enemy.x = newX;
        enemy.y = newY;
    }

    // Ataque del enemigo al jugador
    if (Math.abs(enemy.x - player.x) <= 1 && Math.abs(enemy.y - player.y) <= 1) {
        player.hp -= enemy.attack;
        if (player.hp <= 0) {
            alert('Game Over');
        }
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        enemyMove(enemy);
    });

    if (player.hp > 0) {
        renderMap();
        setTimeout(updateEnemies, 1000); // Actualiza los enemigos cada 1 segundo
    }
}
function enemySymbol(level) {
    if (level === 1) return 'g';
    if (level === 2) return 'G';
    if (level === 3) return 'r';
    if (level === 4) return 'R';
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'w' || event.key === 'ArrowUp') move('up');
    if (event.key === 's' || event.key === 'ArrowDown') move('down');
    if (event.key === 'a' || event.key === 'ArrowLeft') move('left');
    if (event.key === 'd' || event.key === 'ArrowRight') move('right');
    if (event.key === ' ') attack();
});

loadMap(currentMap);
updateEnemies(); // Inicia el movimiento de enemigos
