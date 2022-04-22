const initForm = (createMapCallback) => {
    const formDom = document.getElementById('map-initializer-form');

    formDom.addEventListener('submit' , function (e) {
        e.preventDefault();
        const width = formDom.querySelector('[name="width"]').value;

        if (isValidWidth(width))
            createMapCallback(width)
        else
            alert('The width must be 10 or more and 19 or less!')
    })
}

const isValidWidth = (width) => {
    return 10 <= width && width <= 19;
}

const createMap = (width) => {
    const _map = [];
    const height = width;

    const mapDom = document.getElementById('map');
    mapDom.innerHTML = '';

    for (let i = 0; i < height; i++) {
        const row = [];
        const rowDom = document.createElement('div');
        rowDom.className = 'row';

        for (let j = 0; j < width; j++) {
            const columnDom = document.createElement('div');
            columnDom.className = 'column';
            columnDom.textContent = `➕`;
            rowDom.appendChild(columnDom);

            const column = {
                x: i,
                y: j,
                dom: columnDom,
                stone: null,
            };

            mapDom.appendChild(rowDom);
            row.push(column);
        }
        _map.push(row);
    }

    return _map;
}

const startGame = (currentTurn, turn, map, stoneStack) => {
    currentTurn = turn;

    map.forEach(row => {
        row.forEach(column => {
            column.dom.addEventListener('click', function() {

                const stone = peek(stoneStack);
                if (isSamePlace(stone, column)) {
                    undo(map, stoneStack);
                    return;
                }

                if (!isEmptyPlace(column))
                    return;

                column.stone = currentTurn;
                if (currentTurn === 'black') {
                    column.dom.textContent = '⚫️';
                    currentTurn = 'white';
                } else {
                    column.dom.textContent = '⚪️';
                    currentTurn = 'black';
                }

                stoneStack.push(column);

                if(isGameEnded(map, column)) {
                    endGame();
                }
            });
        });
    });
}

function peek(stack) {
    if (stack.length === 0)
        return null;

    return stack[stack.length - 1];
}

function isSamePlace(stone, column) {
    if (!stone)
        return false;

    return stone.x === column.x && stone.y === column.y;
}

function undo(map, stoneStack) {
    const stone = stoneStack.pop();
    const column = map[stone.x][stone.y];
    column.dom.textContent = '➕';
    column.stone = null;
}

function isEmptyPlace(column) {
    return !column.stone
}

const isGameEnded = (map, column) => {
    return isCurrentRowContainFiveStone(map, column) ||
        isCurrentColumnContainFiveStone(map, column) ||
        isFirstDiagonalContainFiveStone(map, column) ||
        isSecondDiagonalContainFiveStone(map, column);
};

const isCurrentRowContainFiveStone = (map, column) => {
    let count = 0;
    const targetStone = column.stone;
    let prevStone = '';
    for (let i = 0; i < map[0].length; i++) {
        if (prevStone && prevStone === targetStone) {
            count += 1;
        }

        if (count === 5)
            return true;

        if (prevStone !== targetStone) {
            count = 0;
        }

        prevStone = map[column.x][i].stone;
    }
    return false;
};

const isCurrentColumnContainFiveStone = (map, column) => {
    let count = 0;
    const targetStone = column.stone;
    let prevStone = '';
    for (let j = 0; j < map.length; j++) {
        if (prevStone && prevStone === targetStone) {
            count += 1;
        }

        if (count === 5)
            return true;

        if (prevStone !== targetStone) {
            count = 0;
        }

        prevStone = map[j][column.y].stone;
    }
    return false;
};

const isFirstDiagonalContainFiveStone = (map, column) => {
    let count = 0;
    const targetStone = column.stone;
    let prevStone = '';
    let x = column.x;
    let y = column.y;

    while (x > 0 && y > 0) {
        x -= 1;
        y -= 1;
    }

    while (x < map.length && y < map[0].length) {
        if (prevStone && prevStone === targetStone) {
            count += 1;
        }

        if (count === 5)
            return true;

        if (prevStone !== targetStone) {
            count = 0;
        }

        prevStone = map[x][y].stone;

        x += 1;
        y += 1;
    }

    return false;
};

const isSecondDiagonalContainFiveStone = (map, column) => {
    let count = 0;
    const targetStone = column.stone;
    let prevStone = '';
    let x = column.x;
    let y = column.y;

    while (y < map[0].length - 1 && x > 0) {
        x -= 1;
        y += 1;
    }

    console.log(x, y);

    while (x < map.length && y >= 0) {
        if (prevStone && prevStone === targetStone) {
            count += 1;
        }

        if (count === 5)
            return true;

        if (prevStone !== targetStone) {
            count = 0;
        }

        prevStone = map[x][y].stone;

        x += 1;
        y -= 1;
    }

    return false;
};

const endGame = () => {
    // 게임 종료 처리.
    console.log('game is ended!');
    location.reload();
};

const main = () => {
    let map = [];
    let currentTurn = null;
    const stoneStack = [];

    initForm(width => {
        map = createMap(width);
        startGame(currentTurn, 'black', map, stoneStack);
    });
};

main();